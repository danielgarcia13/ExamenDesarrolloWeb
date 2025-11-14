const express = require('express')
const app = express()
const { readJSON, writeJSON } = require('./utils/fileManager')
const PORT = 3000

app.use(express.json())

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente 🚀');
})
//OBTENER LISTA COMPLETA DE PACIENTES
app.get('/pacientes', (req, res) => {
  const pacientes = readJSON('pacientes.json')
  res.json(pacientes)
})
//OBTENER PACIENTE POR ID
app.get('/pacientes/:id', (req, res)=>{
    //Obtener ID y lista de pacientes
    const id=req.params.id
    const pacientes=readJSON('pacientes.json')

    //Busca el paciente en base a su ID
    pacienteBuscado=pacientes.find(p=>p.id===id)

    if(!pacienteBuscado) {
       return res.status(404).json({mensaje: 'No existe un paciente con ese ID'})
    }
    res.json(pacienteBuscado)
})
//AGREGAR UN PACIENTE NUEVO
app.post('/pacientes', (req, res)=> {

    const nuevoPaciente = req.body
    const pacientesActuales=readJSON('pacientes.json')

 // Validar si se ingresaron los datos completos del paciente
    if(!nuevoPaciente.nombre || !nuevoPaciente.email || !nuevoPaciente.telefono || nuevoPaciente.edad===undefined) {
        return res.status(400).json({error: "Faltan datos obligatorios"})
    }
// Validar si la edad es mayor a 0
    if (nuevoPaciente.edad<=0) {
        return res.status(400).json({error: "La edad debe ser mayor a 0"})
    }
// Validar si el email ingresado es único
    const emailExiste=pacientesActuales.some(paciente=>paciente.email===nuevoPaciente.email) 
    if(emailExiste){
        return res.status(400).json({error: "El email ya está registrado"})
    }
//Después de validar, generamos el ID único para el nuevo paciente

    const nuevoID=`P${String(pacientesActuales.length + 1).padStart(3, '0')}`
    
    //Y ahora creamos el nuevo paciente
    const pacienteCompleto={
        id : nuevoID,
        nombre: nuevoPaciente.nombre,
        edad: nuevoPaciente.edad,
        telefono: nuevoPaciente.telefono,
        email: nuevoPaciente.email,
        fechaRegistro: new Date().toISOString().split('T')[0]
  }

  //Lo agregamos al array de pacientesActuales
    pacientesActuales.push(pacienteCompleto)
    writeJSON('pacientes.json', pacientesActuales)

  //Mensaje de éxito
  res.status(201).json({ mensaje: 'Paciente registrado exitosamente', paciente: pacienteCompleto });
    }
)
//MODIFICAR DATOS DE UN PACIENTE YA REGISTRADO
app.put('/pacientes/:id', (req, res)=>{

    const pacientesActuales=readJSON('pacientes.json')
    const id=req.params.id
    //Datos actualiazdos vienen en req.body
    const datosNuevos=req.body
    
    //Buscar si existe un paciente con el ID proporcionado
    const indicePaciente=pacientesActuales.findIndex(p=>p.id===id)
    if(indicePaciente===-1) {
       return res.status(400).json({error: 'No existe un paciente con ese ID'})
    }

    //En caso de existir el paciente, guardamos la información actual
    const pacienteViejo=pacientesActuales[indicePaciente]

    //Validación de edad
    if(datosNuevos.edad!==undefined){
        if(datosNuevos.edad<=0)
        {
            return res.status(400).json({error: 'La edad debe ser mayor a 0'})
        }
    }
    //Validar si el correo es único
    if(datosNuevos.email && datosNuevos.email!==pacienteViejo.email) {
        const emailExiste=pacientesActuales.some(p=>p.email===datosNuevos.email)
        if(emailExiste) {
            return res.status(400).json({error:'El email ya está registrado'})
        }
    }

    //Sobreescribimos los datos con los datos brindados en el req.body
    //evitando que el ID y la fecha de registro sean modificadas
    const pacienteActualizado={
        ...pacienteViejo,
        ...datosNuevos,
        id:pacienteViejo.id,
        fechaRegistro:pacienteViejo.fechaRegistro}

    //Actualizamos al paciente
    pacientesActuales[indicePaciente]=pacienteActualizado

    //Modificamos el pacientes.json con la versión actualizada
    writeJSON('pacientes.json', pacientesActuales)

    //Mensaje de éxito
    res.status(200).json({mensaje: 'Paciente actualizado con éxito', paciente: pacienteActualizado})
})
//REVISAR EL HISTORIAL DE LOS PACIENTES
app.get('/pacientes/:id/historial', (req, res)=>{

    const pacientesActuales=readJSON('pacientes.json')
    const citasActuales=readJSON('citas.json')
    const pacienteId=req.params.id

    //Encontrar si el paciente solicitado existe
    const pacienteBuscado=pacientesActuales.find(p=>p.id===pacienteId)
    
    //En caso de no existir, arrojar error
    if(!pacienteBuscado) {
        return res.status(404).json({error: 'No existe un paciente con ese ID'})
    }
    
    //Filtrar las citas que coincidan con el ID del paciente buscado
    citasPaciente=citasActuales.filter(c=>c.pacienteId===pacienteId)
    
    //Arrojar respuesta
    res.json(citasPaciente)
})
//OBTENER LISTA COMPLETA DE DOCTORES
app.get('/doctores', (req, res)=> {
    const doctores=readJSON('doctores.json')
    res.json(doctores)
})
//OBTENER DOCTORES POR FILTRO AVANZADO
app.get('/doctores/disponibles', (req, res)=>{
    const doctoresActuales=readJSON('doctores.json')
    const citasActuales=readJSON('citas.json')
    const {fecha, hora} = req.query
    //Confirmar si se ingresaron fecha y hora en la busqueda
    if(!fecha || !hora) {
        return res.status(400).json({error: 'Es necesario indicar los parametros de busqueda específica'})
    }
    //Variables de control para los días de la semana
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const fechaObj = new Date(fecha + "T00:00:00");
    const diaSemana = diasSemana[fechaObj.getDay()]
    
    //Filtrar doctores disponibles
    const doctoresDisponibles=doctoresActuales.filter(d=>{
    //Validar si el doctor trabaja el día de la fecha indicada
    if(!d.diasDisponibles.includes(diaSemana)) return false

    //Validar si el doctor trabaja en la hora indicada
    if(hora<d.horarioInicio || hora>d.horarioFin)  return false

    //Validar si existe una cita a esa fecha y hora exactas
    const estaOcupado=citasActuales.some(c=>
        c.doctorId===d.id &&
        c.fecha===fecha &&
        c.hora=== hora &&
        c.estado==='programada')

    if(estaOcupado) return false
    //En caso de pasar todas las validaciones, está disponible
    return true
    })
    res.status(200).json({
        fecha: fecha,
        hora: hora,
        diaSemana: diaSemana,
        totalDisponibles: doctoresDisponibles.length,
        doctores: doctoresDisponibles
    })
})
//OBTENER DOCTOR POR ESPECIALIDAD
app.get('/doctores/especialidad/:especialidad', (req, res)=>{
    const especialidad=req.params.especialidad
    const doctores=readJSON('doctores.json')

    const doctorBuscado=doctores.filter(d=>d.especialidad===especialidad)

    if(!doctorBuscado) {
        return res.status(404).json({error:'No existe un doctor con esa especialidad'})
    }
    res.json(doctorBuscado)
})
//OBTENER DOCTOR POR ID
app.get('/doctores/:id', (req, res)=>{
    const id=req.params.id
    const doctores=readJSON('doctores.json')

    const doctorBuscado=doctores.find(d=>d.id===id)

    if(!doctorBuscado) {
        return res.status(404).json({error: 'No existe doctor con ese ID'})
    }
    res.json(doctorBuscado)
})
//AGREGAR UN DOCTOR NUEVO
app.post('/doctores', (req, res)=>{
    const nuevoDoctor=req.body
    const doctoresActuales=readJSON('doctores.json')

    //Validar si se ingresaron todos los datos necesarios para el registro
    if(!nuevoDoctor.nombre || !nuevoDoctor.especialidad || !nuevoDoctor.horarioInicio
    || !nuevoDoctor.horarioFin || !nuevoDoctor.diasDisponibles) {
        return res.status(400).json({error: 'No se ingresaron todos los datos necesarios'})
    }

    //Validar si ya existe un doctor con el mismo nombre y especialidad
    const existeDoctor=doctoresActuales.some(d=>
    d.nombre===nuevoDoctor.nombre && d.especialidad===nuevoDoctor.especialidad
    )
    //En caso de existir, arrojar mensaje de error
    if(existeDoctor) {
        return res.status(400).json({error: 'Ya existe un doctor con ese nombre y especialidad'})
    }
    
    //Validar si el horario del doctor es válido (horarioInicio<horarioFin)
    if(nuevoDoctor.horarioInicio>=nuevoDoctor.horarioFin){
        return res.status(400).json({error: 'El horario del doctor no es válido'})
    }
    
    //Validar si díasDisponibles está vacío o si no es un array
    if(nuevoDoctor.diasDisponibles.length===0
    || !Array.isArray(nuevoDoctor.diasDisponibles)
    ) {
        //Si no se registró ningún día, arrojar error
        return res.status(400).json({error: 'El doctor debe contar con al menos un día disponible'})
    }

    //Una vez validada la información, generamos el ID de nuevoDoctor
    const nuevoID=`D${String(doctoresActuales.length + 1).padStart(3, '0')}`

    //Creamos al nuevoDoctor
    const doctorCompleto= {
        id:nuevoID,
        nombre:nuevoDoctor.nombre,
        especialidad:nuevoDoctor.especialidad,
        horarioInicio:nuevoDoctor.horarioInicio,
        horarioFin:nuevoDoctor.horarioFin,
        diasDisponibles:nuevoDoctor.diasDisponibles
    }

    //Lo agregamos a la lista de doctores
    doctoresActuales.push(doctorCompleto)
    writeJSON('doctores.json',doctoresActuales)

    //Mensaje de éxito
    return res.status(201).json({
        mensaje: 'Doctor agregado con éxito',
        doctor: doctorCompleto})

})
//AGREGAR NUEVA CITA
app.post('/citas', (req, res)=>{
    const nuevaCita=req.body
    const citasActuales=readJSON('citas.json')
    const pacientesActuales=readJSON('pacientes.json')
    const doctoresActuales=readJSON('doctores.json')

    //Validar que paciente existe
    const pacienteExiste=pacientesActuales.some(p=>p.id===nuevaCita.pacienteId)
    if(!pacienteExiste) {
        return res.status(404).json({error:'No existe paciente con ese ID'})
    }

    //Validar que doctor existe
    const doctorExiste=doctoresActuales.some(d=>d.id===nuevaCita.doctorId)
    if(!doctorExiste) {
        return res.status(404).json({error:'No existe doctor con ese ID'})
    }
    
    //Validar que la fecha sea futura
    const fechaActual=new Date()
    const fechaCita=new Date(nuevaCita.fecha)

    fechaActual.setHours(0, 0, 0, 0)

    if(fechaCita<=fechaActual) {
        return res.status(400).json({error: 'La fecha de la cita debe ser futura'})
    }

    //Validar si el día está en el horario del doctor
    const diasSemana=['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const diaCita=diasSemana[fechaCita.getDay()]

    const doctorSolicitado=doctoresActuales.find(d=>d.id===nuevaCita.doctorId)

    if(!doctorSolicitado.diasDisponibles.includes(diaCita)){
        return res.status(400).json({error: 'El doctor no trabaja el día solicitado'})
    }

    //Validar si el horario de la cita está dentro del horario del doctor
    if(nuevaCita.hora<doctorSolicitado.horarioInicio || nuevaCita.hora>doctorSolicitado.horarioFin) {
        return res.status(400).json({
        error: `El doctor no se encuentra disponible en el horario solicitado. (Disponible de ${doctorSolicitado.horarioInicio} a ${doctorSolicitado.horarioFin})`})
    }

    //Validar si ya existe una cita en ese horario
    const citaConflicto = citasActuales.some(c =>
        c.doctorId === nuevaCita.doctorId &&
        c.fecha === nuevaCita.fecha &&
        c.hora === nuevaCita.hora &&
        c.estado !== 'cancelada'
    )

    if (citaConflicto) {
        return res.status(400).json({error: 'El doctor ya tiene una cita a esa hora' })
    }

    //Crear nuevo ID
    const nuevoID=`C${String(citasActuales.length + 1).padStart(3, '0')}`

    //Construimos la cita completa
    const citaCompleta= {
    id: nuevoID,
    pacienteId: nuevaCita.pacienteId,
    doctorId: nuevaCita.doctorId,
    fecha: nuevaCita.fecha,
    hora: nuevaCita.hora,
    motivo: nuevaCita.motivo,
    estado: "programada"
    }

    //Modificamos el array de citas y sobreescribimos citas.json
    citasActuales.push(citaCompleta)
    writeJSON('citas.json', citasActuales)
    //Mensaje de éxito
    res.status(201).json({mensaje:'Cita agregada con éxito para el día ', cita: citaCompleta})

})
//BUSCAR CITAS CON FILTRO OPCIONAL POR FECHA
app.get('/citas', (req, res)=>{

    const citasActuales=readJSON('citas.json')
    const fecha=req.query.fecha
    
    //Validar si se buscó por fecha
    if(!fecha) {
        //Si no, devolver todo el array
        return res.json(citasActuales)
    }
    //Filtrar citas por fecha
    const citasFiltradas=citasActuales.filter(c=>c.fecha===fecha)
        
    if(citasFiltradas.length===0) //En caso de el array resultante estar vacío, notificamos al usuario que no hay citas en esa fecha
    {
        return res.status(404).json({error: 'No hay citas registradas para la fecha solicitada'})
    }
    //Regresar citas filtradas
    res.json(citasFiltradas)
})
//BUSCAR CITAS REGISTRADAS PARA LAS PRÓXIMAS 24 HORAS
app.get('/citas/proximas', (req, res) => {
    const citasActuales = readJSON('citas.json');
    //Variables de control para fecha actual y fecha dentro de 24 horas
    const ahora = new Date();
    const dentroDE24Horas = new Date();
    dentroDE24Horas.setHours(ahora.getHours() + 24);

    const citasProximas = citasActuales.filter(c => {
        //Descartar la cita si no está con estado de programada
        if (c.estado!=='programada') return false

        //Convertir la fecha y hora de la cita al formato Date
        const fechaHoraCita = new Date(`${c.fecha}T${c.hora}:00`)

        //Regresar si la fecha está dentro del rango de 24 horas
        return fechaHoraCita >= ahora && fechaHoraCita <= dentroDE24Horas
    })

    res.status(200).json({
        mensaje: 'Citas próximas en las siguientes 24 horas',
        totalCitas: citasProximas.length,
        citas: citasProximas
    })
})
//BUSCAR CITAS POR ID
app.get('/citas/:id',(req, res)=>{
    
    const citasActuales=readJSON('citas.json')
    const idCita=req.params.id

    //Buscar la cita por Id
    const citaBuscada=citasActuales.find(c=>c.id===idCita)

    //En caso de no existir cita con dicho Id
    if(!citaBuscada) {
    return res.status(404).json({error:'No existe una cita registrada con ese ID'})   
    }

    //Devolver cita buscada
    res.json(citaBuscada)
})
//BUSCAR AGENDA COMPLETA DE UN DOCTOR
app.get('/citas/doctor/:doctorId', (req, res)=>{
    const citasActuales=readJSON('citas.json')
    const doctoresActuales=readJSON('doctores.json')
    const doctorId=req.params.doctorId

    //Validar si el doctor existe
    const doctorExiste=doctoresActuales.find(d=>d.id===doctorId)
    if(!doctorExiste) {
        return res.status(404).json({error: 'No existe doctor con el ID proporcionado'})
    }

    //Filtrar únicamente las citas del doctor correspondiente al ID brindado
    const agendaDoctor=citasActuales.filter(c=>c.doctorId===doctorId)

    //Mensaje de éxito y resumen de la agenda del doctor
    res.status(200).json({mensaje: 'Busqueda realizada exitosamente',
        doctor: doctorExiste.nombre,
        totalCitas: agendaDoctor.length,
        agenda: agendaDoctor})
})
//CANCELAR CITAS CON ID
app.put('/citas/:id/cancelar', (req, res)=>{

    const citaId=req.params.id
    const citasActuales=readJSON('citas.json')

    //Confirmar si cita existe
    const indiceCita=citasActuales.findIndex(c=>c.id===citaId)

    //En caso de no existir cita buscada
    if(indiceCita===-1) {
        return res.status(404).json({error: 'No existe una cita registrada con el ID proporcionado'})
    }
    
    const citaBuscada=citasActuales[indiceCita]
    //Validar que la cita tenga estado de "programada"
    if(citaBuscada.estado!=="programada") {
        return res.status(400).json({error: 'La cita buscada no está programada'})
    }
    
    //Cambiar estado de la cita a cancelada y actualizar array
    citaBuscada.estado="cancelada"    
    citasActuales[indiceCita]=citaBuscada

    //Actualiar archivo citas.json
    writeJSON('citas.json', citasActuales)

    return res.status(200).json({mensaje: 'Cita cancelada con éxito', cita: citaBuscada})
})
//ESTADISTICA DOCTOR CON MÁS CITAS
app.get('/estadisticas/doctores', (req, res)=>{

    const doctoresActuales=readJSON('doctores.json')
    const citasActuales=readJSON('citas.json')
     
    //Contar las citas por doctor
    const citasPorDoctor = citasActuales.reduce((acc, c) => {
    acc[c.doctorId] = (acc[c.doctorId] || 0) + 1
    return acc
    }, {})
    //Variables de control para buscar el doctor con más citas
    let doctorConMasCitas=null
    let maxCitas=0

    //Recorrer el array citasPorDoctor
    for (const doctorId in citasPorDoctor) {
        //Validar el doctor actual tiene más citas que el máximo actual 
        if(citasPorDoctor[doctorId]>maxCitas) {
            //Actualizar variables de control
            maxCitas=citasPorDoctor[doctorId]
            doctorConMasCitas=doctorId
        }
    }
    //Guardar la información completa del doctor con más citas
    const doctor=doctoresActuales.find(d=>d.id===doctorConMasCitas)

    //Mensaje con la respuesta
    res.status(200).json({
        mensaje: 'Doctor con más citas',
        doctor: {
            id: doctor.id,
            nombre: doctor.nombre,
            especialidad: doctor.especialidad,
            totalCitas: maxCitas
        }
    })
})
//ESTADISTICA ESPECIALIDAD MÁS SOLICITADA 
app.get('/estadisticas/especialidades', (req, res)=>{

    const doctoresActuales=readJSON('doctores.json')
    const citasActuales=readJSON('citas.json')

    const citasPorEspecialidad=citasActuales.reduce((acc, c)=>{

        //Buscar doctor correspondiente a la cita
        const doctor=doctoresActuales.find(d=>d.id===c.doctorId)

        //Obtener especialidad del doctor
        const especialidad=doctor.especialidad

        //Sumar una cita al contador de esa especialidad
        acc[especialidad]=(acc[especialidad] || 0) + 1
        return acc


    }, {})
    //Variables de control para encontrar la especialidad más solicitada
    let especialidadMasSolicitada=null
    let maxCitas=0

    //Recorrer el array citasPorEspecialidad
    for(const especialidad in citasPorEspecialidad) {
        //Validar si la especialidad actual tiene más citas que el máximo actual
        if(citasPorEspecialidad[especialidad] > maxCitas) { 
            //Actualizar variables de control
            maxCitas=citasPorEspecialidad[especialidad]
            especialidadMasSolicitada=especialidad
        }
    }
    //Mensaje con la respuesta
    res.status(200).json({
        mensaje: 'Especialidad más solicitada',
        especialidad: especialidadMasSolicitada,
        totalCitas: maxCitas,
    })
})
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});