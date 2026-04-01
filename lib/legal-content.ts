const CONTACT_EMAIL =
  process.env.CONTACT_EMAIL ||
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
  'soporte@cheroseguro.com';

export const LEGAL_CONTENT = {
  companyName: 'Chero Seguro',
  effectiveDate: '31 de marzo de 2026',
  contactEmail: CONTACT_EMAIL,
  terms: {
    title: 'Términos y Condiciones',
    intro:
      'Al usar Chero Seguro aceptas estos términos. La plataforma es educativa y de concienciación en ciberseguridad.',
    sections: [
      {
        heading: 'Uso de la plataforma',
        points: [
          'El contenido está orientado a formación y práctica de buenas prácticas digitales.',
          'Te comprometes a usar la plataforma de forma legal y responsable.',
          'No debes intentar afectar la disponibilidad, seguridad o funcionamiento del servicio.'
        ]
      },
      {
        heading: 'Limitación de responsabilidad',
        points: [
          'La plataforma se ofrece "tal cual" y "según disponibilidad".',
          'No garantizamos que el servicio esté libre de errores o interrupciones permanentes.',
          'Chero Seguro no asume responsabilidad por daños directos o indirectos derivados del uso de la plataforma o de decisiones tomadas con base en el contenido.'
        ]
      },
      {
        heading: 'Cuenta y acceso',
        points: [
          'Eres responsable de mantener la confidencialidad de tus credenciales.',
          'Podemos suspender cuentas con uso abusivo, fraudulento o contrario a estos términos.'
        ]
      }
    ]
  },
  privacy: {
    title: 'Política de Privacidad',
    intro:
      'En Chero Seguro protegemos tus datos personales y aplicamos el principio de minimización de datos.',
    sections: [
      {
        heading: 'Datos que recolectamos',
        points: [
          'Recolectamos la mínima información necesaria para crear y operar tu cuenta: nombre, apellido, correo y datos básicos de progreso.',
          'No solicitamos información sensible que no sea necesaria para el propósito educativo de la plataforma.'
        ]
      },
      {
        heading: 'Uso de los datos',
        points: [
          'Usamos tus datos para autenticación, recuperación de acceso, seguimiento de progreso y mejora del servicio.',
          'No vendemos tus datos personales a terceros.'
        ]
      },
      {
        heading: 'Seguridad y conservación',
        points: [
          'Aplicamos medidas técnicas y organizativas razonables para proteger tu información.',
          'Conservamos los datos durante el tiempo necesario para operar la cuenta o cumplir obligaciones legales.'
        ]
      },
      {
        heading: 'Tus derechos',
        points: [
          'Puedes solicitar actualización o eliminación de tu información escribiendo a soporte.',
          'Puedes solicitar cierre de cuenta en cualquier momento.'
        ]
      }
    ]
  }
} as const;
