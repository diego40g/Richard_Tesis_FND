import { Button, Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useState } from "react";
import UpdateUserData from "@/helpers/handlers/UpdateUserData";
import { Usuario } from "@/helpers/models/User";
import toast from "react-hot-toast";

interface Props {
  selectedUser: Usuario;
  newRole: string;
  onClose: () => void;
}

export default function ConfirmarCambioRol({
  selectedUser,
  newRole,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await UpdateUserData({
      selectedUser,
      data: { rol: newRole },
    });
    setLoading(false);
    toast.success(
      `Has cambiado el rol de ${selectedUser.nombre} ${selectedUser.apellido} a ${newRole}.`
    );
    window.location.reload();
  };

  return (
    <>
      <Modal aria-modal={"true"} show={true} size="xl" onClose={onClose} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              ¿Seguro que deseas cambiar el rol del usuario{" "}
              <span className="text-blue-600">
                {selectedUser.nombre} {selectedUser.apellido}{" "}
              </span>
              a <span className="text-indigo-700">{newRole}</span>?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleClick} disabled={loading}>
                {loading ? "Cargando..." : "Sí, estoy seguro"}
              </Button>
              <Button color="gray" onClick={onClose} disabled={loading}>
                No, cancelar
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
