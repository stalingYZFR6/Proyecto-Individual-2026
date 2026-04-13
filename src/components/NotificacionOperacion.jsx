import { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const NotificacionOperacion = ({ mostrar, mensaje, tipo, onCerrar }) => {
    const [visible, setVisible] = useState(mostrar);

    useEffect(() => {
        setVisible(mostrar);
    }, [mostrar]);

    // Función para obtener fecha y hora local formateada
    const fechaLocal = () => {
        const fecha = new Date();
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        const hora = fecha.toTimeString().slice(0, 5);

        return `${dia}-${mes}-${anio} ${hora}`;
    };

    const handleClose = () => {
        setVisible(false);
        onCerrar?.(); // Llama a onCerrar si existe
    };

    return (
        <ToastContainer position="top-center" className="p-2">
            <Toast
                onClose={handleClose}
                show={visible}
                delay={2500}
                autohide
                bg={
                    tipo === 'exito'
                        ? 'success'
                        : tipo === 'advertencia'
                            ? 'warning'
                            : 'danger'
                }
            >
                <Toast.Header>
                    <strong className="me-auto">
                        {tipo === 'exito' ? (
                            <>✅ Éxito</>
                        ) : tipo === 'advertencia' ? (
                            <>⚠️ Advertencia</>
                        ) : (
                            <>❌ Error</>
                        )}
                    </strong>
                    <small>{fechaLocal()}</small>
                </Toast.Header>

                <Toast.Body
                    className={
                        tipo === 'exito' || tipo === 'error' ? 'text-white' : ''
                    }
                >
                    {mensaje}
                </Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

export default NotificacionOperacion;