import prisma from '@/lib/db';

export async function autoAssignTechnician(defectId: string) {
  const defect = await prisma.defect.findUnique({
    where: { id: defectId },
    include: { department: true },
  });

  if (!defect) throw new Error('Defect not found');

  // Find technicians in the required department
  const technicians: any[] = await prisma.user.findMany({
    where: {
      role: 'TECHNICIAN',
      departmentId: defect.departmentId,
    },
    include: {
      defects: {
        where: {
          status: { in: ['OPEN', 'ASSIGNED'] },
        },
      },
    },
  });

  if (technicians.length === 0) {
    // Fallback: any available technician
    const fallbackTechs: any[] = await prisma.user.findMany({
      where: { role: 'TECHNICIAN' },
      include: {
        defects: {
          where: { status: { in: ['OPEN', 'ASSIGNED'] } },
        },
      },
    });

    if (fallbackTechs.length === 0) return null;
    technicians.push(...fallbackTechs);
  }

  // Sort by lowest active workload
  technicians.sort((a: any, b: any) => a.defects.length - b.defects.length);
  const bestTech = technicians[0];

  const updatedDefect = await prisma.defect.update({
    where: { id: defectId },
    data: {
      technicianId: bestTech.id,
      status: 'ASSIGNED',
    },
    include: {
      technician: true,
    },
  });

  return updatedDefect;
}
