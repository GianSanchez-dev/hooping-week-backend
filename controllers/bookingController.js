const prisma = require('../prismaClient');

// 1. OBTENER RESERVAS
exports.getBookings = async (req, res) => {
  try {
    const { venueId, start, end, userId } = req.query; // <--- AÑADIDO userId

    const where = {};
    if (venueId) where.venueId = parseInt(venueId);
    if (userId) where.userId = parseInt(userId); // <--- FILTRO NUEVO
    
    if (start && end) {
      where.startTime = { gte: new Date(start), lte: new Date(end) };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        venue: true,
        user: { select: { fullName: true, avatar: true, role: true } }
      },
      orderBy: { startTime: 'asc' } // Ordenar por fecha
    });


    const events = bookings.map(b => ({
      id: b.id.toString(),
      title: b.title,
      start: b.startTime,
      end: b.endTime,
      backgroundColor: b.status === 'pending' ? '#f59e0b' : (b.status === 'approved' ? '#10b981' : '#ef4444'),
      borderColor: b.status === 'pending' ? '#d97706' : (b.status === 'approved' ? '#059669' : '#b91c1c'),
      extendedProps: {
        // AGREGA ESTA LÍNEA 👇
        venueName: b.venue.name, // <--- CRUCIAL: Enviamos el nombre real
        
        id: b.id,
        status: b.status,
        description: b.description,
        sportType: b.sportType,
        banner: b.banner,
        teams: b.teamsSnapshot,
        bookedBy: b.user ? { 
            name: b.user.fullName, 
            avatar: b.user.avatar, 
            role: b.user.role 
        } : { name: 'Anónimo', avatar: null } 
      }
    }));

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

// 2. CREAR RESERVA (CORREGIDO)
exports.createBooking = async (req, res) => {
  try {
    const { 
      title, start, end, venueId, 
      sportType, description, banner, team, // 'team' es un array de nombres de equipos
      userId 
    } = req.body;

    // 1. Construir el Snapshot de Equipos con JUGADORES REALES
    let teamsSnapshot = [];

    if (team && Array.isArray(team) && team.length > 0) {
        // Buscamos los equipos en la BD por nombre
        // (Idealmente usaríamos IDs, pero por compatibilidad con tu form actual usamos nombres)
        const foundTeams = await prisma.team.findMany({
            where: { 
                name: { in: team } 
            },
            include: { 
                players: true // <--- ¡ESTO ES LA CLAVE! Traer los jugadores
            }
        });

        // Mapeamos a la estructura del snapshot
        teamsSnapshot = foundTeams.map(t => ({
            name: t.name,
            logo: t.logo,
            players: t.players // Guardamos los jugadores en el historial de la reserva
        }));

        // Si no se encontró algún equipo (ej: "Sin Equipo"), lo agregamos vacío
        if (teamsSnapshot.length === 0 && team.length > 0) {
             teamsSnapshot = team.map(name => ({ name, logo: null, players: [] }));
        }
    }

    const newBooking = await prisma.booking.create({
      data: {
        title,
        startTime: new Date(start),
        endTime: new Date(end),
        venueId: parseInt(venueId),
        sportType,
        description,
        banner,
        teamsSnapshot, // Ahora incluye jugadores
        status: 'pending',
        userId: userId ? parseInt(userId) : null
      },
      include: { // Incluimos relaciones para devolver la respuesta completa al front
          user: true,
          venue: true
      }
    });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
};

// 3. ACTUALIZAR ESTADO (CON VALIDACIÓN DE CONFLICTOS)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' o 'rejected'

    // 1. Obtenemos los datos de la reserva que queremos aprobar
    // Necesitamos saber su hora inicio/fin y cancha para comparar
    const currentBooking = await prisma.booking.findUnique({
        where: { id: parseInt(id) }
    });

    if (!currentBooking) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // 2. SI VAMOS A APROBAR, VERIFICAMOS CONFLICTOS
    if (status === 'approved') {
        const conflict = await prisma.booking.findFirst({
            where: {
                venueId: currentBooking.venueId, // Misma cancha
                id: { not: currentBooking.id },  // Que no sea ella misma
                // Que esté ocupando el espacio (Aprobada o Bloqueada por mantenimiento)
                status: { in: ['approved', 'blocked'] }, 
                // Lógica de superposición de tiempos:
                // (StartA < EndB) Y (EndA > StartB)
                AND: [
                    { startTime: { lt: currentBooking.endTime } },
                    { endTime: { gt: currentBooking.startTime } }
                ]
            }
        });

        if (conflict) {
            // Retornamos error 409 (Conflict)
            return res.status(409).json({ 
                error: 'CONFLICTO: Ya existe una reserva aprobada o bloqueo en este horario.' 
            });
        }
    }

    // 3. Si no hay conflicto (o si es rechazar), procedemos
    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { venue: true, user: true }
    });

    res.json(updatedBooking);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la reserva' });
  }
};

exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.booking.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Reserva cancelada' });
    } catch (error) {
        console.error(error); // Es bueno loguear el error
        res.status(500).json({ error: 'Error al cancelar reserva' });
    }
};
