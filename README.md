Instituto Tecnológico de Ensenada
Ingeniería en sistemas computacionales
Desarrollo Web I
García Lara Daniel Iván
Xenia Padilla
13 de noviembre del 2025


Vídeo explicación del código y prueba de uso: https://www.youtube.com/watch?v=sZeH7JZThFE
ENDPOINST:

### POST /paciente
Registra un nuevo paciente en el sistema
Request: json
{
    "nombre": "Jair León",
    "edad": 22,
    "telefono": "646-333-22-11",
    "email": "jair.l@email.com"
  }
Response (201) éxitoso
{
  "mensaje": "Paciente registrado exitosamente",
  "paciente": {
    "id": "P009",
    "nombre": "Jair León",
    "edad": 22,
    "telefono": "646-333-22-11",
    "email": "jair.l@email.com",
    "fechaRegistro": "2025-11-14"
  }
}

### POST /doctores
Registra un nuevo doctor en el sistema
Request: json
{
    "nombre": "Dr. Ivan Vazquez",
    "especialidad": "Ginecólogo",
    "horarioInicio": "15:00",
    "horarioFin": "20:00",
    "diasDisponibles": [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes"
    ]
  }

Response (201) éxitoso
{
  "mensaje": "Doctor agregado con éxito",
  "doctor": {
    "id": "D006",
    "nombre": "Dr. Ivan Vazquez",
    "especialidad": "Ginecólogo",
    "horarioInicio": "15:00",
    "horarioFin": "20:00",
    "diasDisponibles": [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes"
    ]
  }
}

### Post /citas
Registrar una nueva cita en el sistema
Request: json

{
    "pacienteId": "P001",
    "doctorId": "D003",
    "fecha": "2025-11-20",
    "hora": "12:00",
    "motivo": "Interpretación de analisis"
  }

  Response (201) éxitoso 
{
  "mensaje": "Cita agregada con éxito para el día ",
  "cita": {
    "id": "C011",
    "pacienteId": "P001",
    "doctorId": "D003",
    "fecha": "2025-11-20",
    "hora": "12:00",
    "motivo": "Interpretación de analisis",
    "estado": "programada"
  }
}
