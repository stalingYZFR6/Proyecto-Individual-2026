import React, { useState } from "react";
import { Card, Badge, Modal, Button } from "react-bootstrap";

const TarjetaCatalogo = ({ producto, categoriaNombre }) => {
    const [mostrarModal, setMostrarModal] = useState(false);

    const descripcion = producto.descripcion_producto || "";

    return (
        <>
            <Card
                className="h-100 shadow cursor-pointer"
                onClick={() => setMostrarModal(true)}
            >
                <div className="ratio ratio-1x1 bg-light">
                    {producto.url_imagen ? (
                        <img
                            src={producto.url_imagen}
                            alt={producto.nombre_producto}
                            className="card-img-top object-fit-cover"
                        />
                    ) : (
                        <div className="d-flex justify-content-center align-items-center h-100">
                            <i className="bi bi-image fs-1"></i>
                        </div>
                    )}
                </div>

                <Card.Body>
                    <Card.Title className="h6">
                        {producto.nombre_producto}
                    </Card.Title>

                    <Badge bg="secondary">
                        {categoriaNombre || "Sin categoría"}
                    </Badge>

                    <h5 className="text-success mt-2">
                        C${producto.precio_venta}
                    </h5>
                </Card.Body>
            </Card>

            {/* MODAL */}
            <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{producto.nombre_producto}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {producto.url_imagen && (
                        <img
                            src={producto.url_imagen}
                            alt=""
                            className="img-fluid mb-3"
                        />
                    )}

                    <p>{descripcion}</p>

                    <Badge bg="secondary">
                        {categoriaNombre || "Sin categoría"}
                    </Badge>

                    <h4 className="text-success mt-3">
                        C${producto.precio_venta}
                    </h4>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setMostrarModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default TarjetaCatalogo;