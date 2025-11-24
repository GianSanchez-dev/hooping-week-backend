const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper para manejar fechas relativas (Hoy, Mañana, Ayer)
const getDate = (daysOffset, hour, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
};

async function main() {
  console.log('🌴 Iniciando Seed: Edición Cartagena de Indias...');

  // -------------------------------------------------------
  // 1. LIMPIEZA TOTAL (Orden estricto por llaves foráneas)
  // -------------------------------------------------------
  await prisma.booking.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Base de datos limpia y lista.');

  // -------------------------------------------------------
  // 2. USUARIOS (El Staff del IDER y Entrenadores)
  // -------------------------------------------------------
  
  // Admin del sistema (IDER Cartagena)
  const admin = await prisma.user.create({
    data: {
      fullName: "Administrador IDER",
      email: "admin@ider.gov.co",
      password: "123", 
      role: "admin_cancha",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Escudo_de_Cartagena_de_Indias.svg/1200px-Escudo_de_Cartagena_de_Indias.svg.png" // Escudo Cartagena
    }
  });

  // Coach Voleibol
  const coachVoley = await prisma.user.create({
    data: {
      fullName: "Profe Carlos Valderrama",
      email: "carlos@voleybolivar.com",
      password: "123",
      role: "coach",
      avatar: "https://i.pravatar.cc/150?u=carlos"
    }
  });

  // Coach Basquet
  const coachBasket = await prisma.user.create({
    data: {
      fullName: "Coach Mike 'La Bestia'",
      email: "mike@piratas.com",
      password: "123",
      role: "coach",
      avatar: "https://i.pravatar.cc/150?u=mike"
    }
  });

  console.log('👤 Usuarios creados: Admin IDER y Entrenadores.');

  // -------------------------------------------------------
  // 3. ESCENARIOS (Venues Reales de Cartagena)
  // -------------------------------------------------------

  const venue1 = await prisma.venue.create({
    data: {
      name: "Coliseo Rocky Valdez",
      location: "Vía La Cordialidad, Km 1",
      image: "https://www.eluniversal.com.co/binrepository/1000x667/0c0/1000d667/none/13704/UGCK/coliseo-rocky-valdez_4234765_20210625111629.jpg", // Foto real o similar
      status: "active",
      settings: {
        // Cerrado los Domingos para mantenimiento
        recurringBlocks: [
          { title: "Mantenimiento Dominical", startTime: "06:00", endTime: "14:00", daysOfWeek: [0] }
        ]
      }
    }
  });

  const venue2 = await prisma.venue.create({
    data: {
      name: "Coliseo Bernardo Caraballo",
      location: "Paseo de Bolívar, Centro",
      image: "https://ider.gov.co/wp-content/uploads/2020/10/Bernardo-Caraballo-1.jpg",
      status: "active",
      settings: { recurringBlocks: [] }
    }
  });

  const venue3 = await prisma.venue.create({
    data: {
      name: "Cancha Sintética Los Calamares",
      location: "Barrio Los Calamares, Etapa 1",
      image: "https://lh3.googleusercontent.com/p/AF1QipN9QO-0fXwQvQ4x5J5Qq4x5J5Qq4x5J5Qq4x5J5=s1360-w1360-h1020",
      status: "maintenance", // Simulamos que está en reparación
      settings: { recurringBlocks: [] }
    }
  });

  console.log('🏟️  Escenarios de Cartagena creados.');

  // -------------------------------------------------------
  // 4. EQUIPOS Y JUGADORES (Talento Local)
  // -------------------------------------------------------

  // Equipo 1: Heroicos Voley (Coach Carlos)
  const teamHeroicos = await prisma.team.create({
    data: {
      name: "Heroicos de Cartagena",
      sport: "Voleibol",
      category: "Elite",
      logo: "https://img.freepik.com/free-vector/spartan-helmet-logo-design_139366-135.jpg",
      banner: "https://images.unsplash.com/photo-1592656094267-764a45160876?q=80&w=2070&auto=format&fit=crop",
      stats: { wins: 15, losses: 2, rank: "#1 Liga Bolívar" },
      coachId: coachVoley.id
    }
  });

  // Jugadores Heroicos
  await prisma.player.createMany({
    data: [
      { name: "Andrés 'El Martillo'", number: 10, position: "Rematador", teamId: teamHeroicos.id, image: "https://i.pravatar.cc/300?u=andres", stats: { height: "1.95m", age: 24 } },
      { name: "Sebas Rincón", number: 5, position: "Libero", teamId: teamHeroicos.id, image: "https://i.pravatar.cc/300?u=sebas", stats: { height: "1.78m", age: 21 } },
      { name: "Jorge Paternina", number: 8, position: "Setter", teamId: teamHeroicos.id, image: "https://i.pravatar.cc/300?u=jorge", stats: { height: "1.85m", age: 23 } }
    ]
  });

  // Equipo 2: Piratas del Caribe (Coach Mike) - Basket
  const teamPiratas = await prisma.team.create({
    data: {
      name: "Piratas del Caribe",
      sport: "Baloncesto",
      category: "Profesional",
      logo: "https://img.freepik.com/free-vector/pirate-mascot-logo-design_139366-168.jpg",
      banner: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2070&auto=format&fit=crop",
      stats: { wins: 5, losses: 5, rank: "#3 Liga Wplay" },
      coachId: coachBasket.id
    }
  });

  // -------------------------------------------------------
  // 5. RESERVAS (Historial, Actuales y Futuras)
  // -------------------------------------------------------

  // A. HISTORIAL (Pasado - Hace 2 días)
  await prisma.booking.create({
    data: {
      title: "Entrenamiento Físico",
      startTime: getDate(-2, 18, 0),
      endTime: getDate(-2, 20, 0),
      venueId: venue1.id,
      userId: coachVoley.id,
      status: "approved",
      sportType: "Físico",
      description: "Sesión de pesas y resistencia.",
      banner: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1000",
      teamsSnapshot: [{ name: "Heroicos de Cartagena", logo: teamHeroicos.logo, players: [] }]
    }
  });

  // B. HOY (Confirmado - Coliseo Rocky Valdez)
  await prisma.booking.create({
    data: {
      title: "Final Interbarrios: Heroicos vs Costeños",
      startTime: getDate(0, 16, 0), // Hoy 4 PM
      endTime: getDate(0, 18, 0),   // Hoy 6 PM
      venueId: venue1.id,
      userId: coachVoley.id,
      status: "approved",
      sportType: "Voleibol",
      description: "Gran final del torneo distrital. Se requiere transmisión en vivo.",
      banner: teamHeroicos.banner,
      // Guardamos el snapshot para que salga bonito en el detalle
      teamsSnapshot: [
        { 
            name: "Heroicos de Cartagena", 
            logo: teamHeroicos.logo, 
            players: [
                { name: "Andrés 'El Martillo'", number: 10, position: "Rematador", image: "https://i.pravatar.cc/300?u=andres", stats: { height: "1.95m" } },
                { name: "Sebas Rincón", number: 5, position: "Libero", image: "https://i.pravatar.cc/300?u=sebas", stats: { height: "1.78m" } }
            ] 
        },
        { name: "Costeños Voley", logo: null, players: [] }
      ]
    }
  });

  // C. MAÑANA (Pendiente - Coliseo Bernardo Caraballo)
  await prisma.booking.create({
    data: {
      title: "Práctica Selección Bolívar",
      startTime: getDate(1, 9, 0), // Mañana 9 AM
      endTime: getDate(1, 11, 0),
      venueId: venue2.id,
      userId: coachBasket.id,
      status: "pending",
      sportType: "Baloncesto",
      description: "Entrenamiento a puerta cerrada preparatorio para Juegos Nacionales.",
      teamsSnapshot: [{ name: "Piratas del Caribe", logo: teamPiratas.logo, players: [] }]
    }
  });

  // D. BLOQUEO ADMINISTRATIVO (Limpieza en Rocky Valdez mañana temprano)
  await prisma.booking.create({
    data: {
      title: "Aseo General y Desinfección",
      startTime: getDate(1, 5, 0),
      endTime: getDate(1, 8, 0),
      venueId: venue1.id,
      userId: null, // Sin usuario
      status: "blocked",
      description: "Limpieza profunda de graderías y maderamen."
    }
  });

  console.log('📅 Agenda deportiva cargada.');
  console.log('🚀 ¡Todo listo en Cartagena! Seed finalizado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
