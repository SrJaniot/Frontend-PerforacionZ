export interface MovimientoBrocaModel {
  fecha: string;
  tipo: 'Entrada' | 'Salida';
  broca: string;
  metrosPerforados: number;
  observacion: string;
}

export interface PerforacionModel {
  idPerforacion: string;
  nombrePerforacion: string;
  estado: string;
  profundidadObjetivo: string;
  metrosPerforados: string;
  supervisor: string;
  historialMovimientoBrocas: MovimientoBrocaModel[];
}

export interface ProyectoModel {
  idProyecto: string;
  nombreSupervisor: string;
  nombreProyecto: string;
  departamento: string;
  municipio: string;
  descripcionProyecto: string;
  fechaCreacion: string;
  status: string;
  priority: string;
  color: string;
  perforaciones: PerforacionModel[];
}

export const PROYECTOS_MOCK: ProyectoModel[] = [
  {
    idProyecto: 'PROY-001',
    nombreSupervisor: 'Carlos Méndez',
    nombreProyecto: 'ERP Cloud Migration',
    departamento: 'Antioquia',
    municipio: 'Medellín',
    descripcionProyecto: 'Migración completa del ERP on-premise a infraestructura cloud AWS.',
    fechaCreacion: '2025-01-12',
    status: 'En curso',
    priority: 'Alta',
    color: 'blue',
    perforaciones: [
      {
        idPerforacion: 'PERF-001',
        nombrePerforacion: 'Pozo Norte 1',
        estado: 'Activa',
        profundidadObjetivo: '1800 m',
        metrosPerforados: '1260 m',
        supervisor: 'Carlos Méndez',
        historialMovimientoBrocas: [
          { fecha: '2026-07-01 08:00', tipo: 'Entrada', broca: 'Broca PDC 12 1/4', metrosPerforados: 0, observacion: 'Ingreso a campo' },
          { fecha: '2026-07-01 13:30', tipo: 'Salida', broca: 'Broca PDC 12 1/4', metrosPerforados: 320, observacion: 'Cambio por desgaste' },
          { fecha: '2026-07-02 07:15', tipo: 'Entrada', broca: 'Broca tricónica 10 5/8', metrosPerforados: 0, observacion: 'Retorno a operación' }
        ]
      },
      {
        idPerforacion: 'PERF-002',
        nombrePerforacion: 'Pozo Norte 2',
        estado: 'En mantenimiento',
        profundidadObjetivo: '1500 m',
        metrosPerforados: '940 m',
        supervisor: 'Laura Torres',
        historialMovimientoBrocas: [
          { fecha: '2026-07-01 09:20', tipo: 'Entrada', broca: 'Broca tricónica 8 1/2', metrosPerforados: 0, observacion: 'Instalación inicial' },
          { fecha: '2026-07-02 11:40', tipo: 'Salida', broca: 'Broca tricónica 8 1/2', metrosPerforados: 210, observacion: 'Ajuste técnico' }
        ]
      }
    ]
  },
  {
    idProyecto: 'PROY-002',
    nombreSupervisor: 'Laura Torres',
    nombreProyecto: 'Portal de Clientes',
    departamento: 'Cundinamarca',
    municipio: 'Bogotá',
    descripcionProyecto: 'Desarrollo del portal web para clientes con autogestión de servicios.',
    fechaCreacion: '2025-02-03',
    status: 'Completando',
    priority: 'Alta',
    color: 'emerald',
    perforaciones: [
      {
        idPerforacion: 'PERF-003',
        nombrePerforacion: 'Bloque A-1',
        estado: 'Activa',
        profundidadObjetivo: '2100 m',
        metrosPerforados: '1640 m',
        supervisor: 'Ana Restrepo',
        historialMovimientoBrocas: [
          { fecha: '2026-07-01 06:45', tipo: 'Entrada', broca: 'Broca PDC 12 1/4', metrosPerforados: 0, observacion: 'Arranque de turno' },
          { fecha: '2026-07-01 17:10', tipo: 'Salida', broca: 'Broca PDC 12 1/4', metrosPerforados: 280, observacion: 'Finalización de tramo' }
        ]
      }
    ]
  },
  {
    idProyecto: 'PROY-003',
    nombreSupervisor: 'Ana Restrepo',
    nombreProyecto: 'App Mobile Nexus',
    departamento: 'Valle del Cauca',
    municipio: 'Cali',
    descripcionProyecto: 'Aplicación móvil para iOS y Android de gestión interna.',
    fechaCreacion: '2025-03-21',
    status: 'En curso',
    priority: 'Media',
    color: 'amber',
    perforaciones: [
      {
        idPerforacion: 'PERF-004',
        nombrePerforacion: 'Lote 4',
        estado: 'Activa',
        profundidadObjetivo: '1750 m',
        metrosPerforados: '980 m',
        supervisor: 'Juan Pablo Ruiz',
        historialMovimientoBrocas: [
          { fecha: '2026-07-02 10:00', tipo: 'Entrada', broca: 'Broca tricónica 9 7/8', metrosPerforados: 0, observacion: 'Inicio operativo' }
        ]
      }
    ]
  },
  {
    idProyecto: 'PROY-004',
    nombreSupervisor: 'Juan Pablo Ruiz',
    nombreProyecto: 'BI Dashboard',
    departamento: 'Atlántico',
    municipio: 'Barranquilla',
    descripcionProyecto: 'Panel de inteligencia de negocios con analítica avanzada.',
    fechaCreacion: '2025-04-08',
    status: 'Iniciando',
    priority: 'Baja',
    color: 'cyan',
    perforaciones: [
      {
        idPerforacion: 'PERF-005',
        nombrePerforacion: 'Plataforma B',
        estado: 'Planificada',
        profundidadObjetivo: '1200 m',
        metrosPerforados: '0 m',
        supervisor: 'Valentina Gómez',
        historialMovimientoBrocas: []
      }
    ]
  },
  {
    idProyecto: 'PROY-005',
    nombreSupervisor: 'Valentina Gómez',
    nombreProyecto: 'Seguridad IT Audit',
    departamento: 'Bolívar',
    municipio: 'Cartagena',
    descripcionProyecto: 'Auditoría completa de seguridad informática y SGSI.',
    fechaCreacion: '2025-04-19',
    status: 'En curso',
    priority: 'Alta',
    color: 'red',
    perforaciones: [
      {
        idPerforacion: 'PERF-006',
        nombrePerforacion: 'Patio Sur',
        estado: 'Activa',
        profundidadObjetivo: '1950 m',
        metrosPerforados: '1355 m',
        supervisor: 'Miguel Ángel Cruz',
        historialMovimientoBrocas: [
          { fecha: '2026-07-03 07:30', tipo: 'Entrada', broca: 'Broca PDC 12 1/4', metrosPerforados: 0, observacion: 'Reinicio de operación' },
          { fecha: '2026-07-03 16:45', tipo: 'Salida', broca: 'Broca PDC 12 1/4', metrosPerforados: 175, observacion: 'Fin de jornada' }
        ]
      }
    ]
  },
  {
    idProyecto: 'PROY-006',
    nombreSupervisor: 'Miguel Ángel Cruz',
    nombreProyecto: 'CRM Integración',
    departamento: 'Risaralda',
    municipio: 'Pereira',
    descripcionProyecto: 'Integración CRM con plataformas de marketing digital.',
    fechaCreacion: '2025-05-02',
    status: 'Completado',
    priority: 'Baja',
    color: 'purple',
    perforaciones: [
      {
        idPerforacion: 'PERF-007',
        nombrePerforacion: 'Campo Oeste',
        estado: 'Cerrada',
        profundidadObjetivo: '2100 m',
        metrosPerforados: '2100 m',
        supervisor: 'Carlos Méndez',
        historialMovimientoBrocas: [
          { fecha: '2026-06-28 08:10', tipo: 'Entrada', broca: 'Broca tricónica 8 1/2', metrosPerforados: 0, observacion: 'Último tramo' },
          { fecha: '2026-06-29 14:15', tipo: 'Salida', broca: 'Broca tricónica 8 1/2', metrosPerforados: 240, observacion: 'Cierre del pozo' }
        ]
      }
    ]
  }
];
