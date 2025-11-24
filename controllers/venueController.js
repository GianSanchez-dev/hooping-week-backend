const prisma = require('../prismaClient');

// 1. OBTENER TODOS (Con sus reservas de tipo bloqueo)
exports.getAllVenues = async (req, res) => {
  try {
    const venues = await prisma.venue.findMany({
      orderBy: { id: 'asc' },
      include: {
        bookings: {
            // Traemos solo los bloqueos futuros para optimizar
            where: { 
                status: 'blocked',
                startTime: { gte: new Date() } 
            }
        }
      }
    });
    res.json(venues);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener escenarios' });
  }
};

// 2. CREAR
exports.createVenue = async (req, res) => {
  try {
    const { name, location, image, status } = req.body;
    const newVenue = await prisma.venue.create({
      data: { name, location, image, status, settings: {} }
    });
    res.status(201).json(newVenue);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear' });
  }
};

// 3. ACTUALIZAR (PUT)
exports.updateVenue = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, image, status, settings } = req.body; // settings tendrá los bloqueos recurrentes

    const updatedVenue = await prisma.venue.update({
      where: { id: parseInt(id) },
      data: { name, location, image, status, settings }
    });

    res.json(updatedVenue);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
};

// 4. ELIMINAR
exports.deleteVenue = async (req, res) => {
  try {
    const { id } = req.params;
    // Opcional: Primero borrar reservas asociadas o usar cascade en DB
    await prisma.booking.deleteMany({ where: { venueId: parseInt(id) } });
    await prisma.venue.delete({ where: { id: parseInt(id) } });
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar' });
  }
};
