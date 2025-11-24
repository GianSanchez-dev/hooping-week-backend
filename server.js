require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // <--- 1. IMPORTAR MORGAN

// Importar rutas
const venueRoutes = require('./routes/venueRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(morgan('dev')); // <--- 2. USAR MORGAN (Modo 'dev' para colores y info concisa)
app.use(express.json());

// Rutas API
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);

app.get('/', (req, res) => {
  res.send('API SportManager Funcionando 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
