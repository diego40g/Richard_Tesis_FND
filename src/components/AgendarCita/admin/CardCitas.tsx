import PopupConfirmarAgendacion from "@/components/Popups/Cita/PopupConfirmarAgendacion";
import PopupEditarCita from "@/components/Popups/Cita/PopupModificarCita";
import { baseUrl } from "@/helpers/constants/BaseURL";
import { headerBearer } from "@/helpers/constants/Headers";
import { isAproabda } from "@/helpers/handlers/HandlerCitas";
import { Cita } from "@/helpers/models/Cita";
import axios from "axios";
import { Button } from "flowbite-react";
import { useState, useEffect } from "react";
import { parseDate } from "@/helpers/handlers/ParseDate";
import "./CardCitas.css";
import toast from "react-hot-toast";
import getHoursParsed from "@/helpers/constants/getHours";

interface Props {
  citas: Cita[];
}

function CardCitas({ citas }: Props) {
  const [showReagendarModal, setShowReagendarModal] = useState<boolean>(false);
  const [showPopupConfirmarCita, setShowPopupConfirmarCita] =
    useState<boolean>(false);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [filtroAceptada, setFiltroAceptada] = useState<boolean | null>(null);
  const [citasActualizadas, setCitasActualizadas] = useState<Cita[]>([]);

  useEffect(() => {
    setCitasActualizadas(citas);
  }, [citas]);

  function handleReagendar(cita: Cita) {
    setSelectedCita(cita);
    setShowReagendarModal(true);
  }

  function handleConfirmarAgendacion(cita: Cita) {
    setSelectedCita(cita);
    setShowPopupConfirmarCita(true);
  }

  function handleFiltrarAceptadas(aceptada: boolean | null) {
    setFiltroAceptada(aceptada);
  }

  async function actualizarCitaEnServidor(citaActualizada: Cita) {
    try {
      const response = await axios.put(
        `${baseUrl}/cita/${citaActualizada.id}`,
        { fecha: citaActualizada.fecha },
        { headers: headerBearer() }
      );
      console.log(response);
      return true;
    } catch (error) {
      console.error("Error al actualizar la fecha de la cita:", error);
      return false;
    }
  }

  const handleReagendamientoCita = async (citaActualizada: Cita) => {
    const exito = await actualizarCitaEnServidor(citaActualizada);
    if (exito) {
      const citasActualizadas = citas.map((cita) => {
        if (cita.id === citaActualizada.id) {
          return citaActualizada;
        }
        return cita;
      });

      // Ordenar las citas por fecha después de actualizar
      citasActualizadas.sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      setCitasActualizadas(citasActualizadas);
      setShowReagendarModal(false);
    } else {
      toast.error(
        "Hubo un error al reagendar la cita. Por favor, intenta de nuevo más tarde."
      );
    }
  };

  const citasFiltradas =
    filtroAceptada !== null
      ? citasActualizadas.filter((cita) => cita.aceptada === filtroAceptada)
      : citasActualizadas;

  return (
    <>
      <div
        className="flex justify-center gap-4 flex-wrap"
        role="navigation"
        aria-label="Filtros de citas"
      >
        <Button
          color="gray"
          onClick={() => handleFiltrarAceptadas(true)}
          aria-label="Mostrar citas aceptadas"
          role="button"
        >
          Mostrar Aceptadas
        </Button>
        <Button
          color="gray"
          onClick={() => handleFiltrarAceptadas(false)}
          aria-label="Mostrar citas pendientes"
          role="button"
        >
          Mostrar Pendientes
        </Button>
        <Button
          color="gray"
          onClick={() => handleFiltrarAceptadas(null)}
          aria-label="Mostrar todas las citas"
          role="button"
        >
          Mostrar Todas
        </Button>
      </div>
      <div
        className="p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 place-items-center mt-10"
        id="citas"
        role="list"
        aria-label="Lista de citas"
      >
        {citasFiltradas.map((cita) => (
          <div
            key={cita.id}
            className={`citas_contenedor ${
              cita.aceptada ? "bg-green-800/30 dark:bg-green-800/30" : ""
            }`}
            role="listitem"
            aria-label={`Cita con ${
              cita.paciente
                ? `${cita.paciente.nombre} ${cita.paciente.apellido}`
                : "Paciente sin asignar"
            }`}
          >
            <div className="datos col-span-1 w-full h-full">
              <div className="col-span-1 motivo flex gap-2">
                <span className="titulos">Paciente:</span>
                <p className="atributos">
                  {cita.paciente
                    ? `${cita.paciente.nombre} ${cita.paciente.apellido}`
                    : "Paciente sin asignar"}
                </p>
              </div>
              <div className="col-span-1 flex">
                <span className="titulos">Fecha de la cita:</span>
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
                <h2 className="atributos"> &nbsp; {parseDate(cita.fecha)}</h2>
              </div>
              <div className="col-span-1 motivo flex gap-2">
                <span className="titulos">Hora:</span>
                <p className="atributos">{getHoursParsed(new Date(cita.fecha).toISOString())}</p>
              </div>
              <div className="col-span-1 motivo flex gap-2">
                <span className="titulos">Motivo de la cita:</span>
                <p className="atributos">{cita.motivo}</p>
              </div>
              {cita.sintomas && (
                <div className="col-span-1 sintomas flex gap-2">
                  <span className="titulos">Síntomas</span>
                  <p className="atributos">{cita.sintomas}</p>
                </div>
              )}
              <div className="col-span-1 motivo flex gap-2">
                <span className="titulos">Aceptada:</span>
                <p className="atributos">{isAproabda(cita.aceptada)}</p>
              </div>
            </div>
            <div className="col-span-1 flex mt-6 gap-3 flex-wrap">
              <Button
                color="success"
                className="grow"
                disabled={cita.aceptada}
                onClick={() => handleConfirmarAgendacion(cita)}
                aria-label={`Aprobar solicitud para ${
                  cita.paciente
                    ? `${cita.paciente.nombre} ${cita.paciente.apellido}`
                    : "Paciente sin asignar"
                }`}
                role="button"
              >
                Aprobar solicitud
              </Button>
              <Button
                onClick={() => handleReagendar(cita)}
                color="purple"
                aria-label={`Reagendar cita para ${
                  cita.paciente
                    ? `${cita.paciente.nombre} ${cita.paciente.apellido}`
                    : "Paciente sin asignar"
                }`}
                role="button"
                className="grow"
              >
                Reagendar
              </Button>
            </div>
          </div>
        ))}

        {selectedCita && showReagendarModal && (
          <PopupEditarCita
            selectedCita={selectedCita}
            onClose={() => setShowReagendarModal(false)}
            onReagendar={handleReagendamientoCita}
            aria-label={`Reagendar cita para ${
              selectedCita.paciente
                ? `${selectedCita.paciente.nombre} ${selectedCita.paciente.apellido}`
                : "Paciente sin asignar"
            }`}
          />
        )}

        {selectedCita && showPopupConfirmarCita && (
          <PopupConfirmarAgendacion
            selectedCita={selectedCita}
            onClose={() => setShowPopupConfirmarCita(false)}
            aria-label={`Confirmar agendación de cita para ${
              selectedCita.paciente
                ? `${selectedCita.paciente.nombre} ${selectedCita.paciente.apellido}`
                : "Paciente sin asignar"
            }`}
          />
        )}
      </div>
    </>
  );
}

export default CardCitas;
