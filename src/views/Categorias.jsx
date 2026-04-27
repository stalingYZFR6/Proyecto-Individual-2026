import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../components/categorias/ModalEliminacionCategoria";
import TarjetaCategoria from "../components/categorias/TarjetaCategoria";
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaCategorias from "../components/categorias/TablaCategorias";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";

const Categorias = () => {

    const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
    const [mostrarModal, setMostrarModal] = useState(false);

    const [nuevaCategoria, setNuevaCategoria] = useState({
        nombre_categoria: "",
        descripcion_categoria: "",
    });

    // BUSQUEDA
    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);

    // paginacion
    const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
    const [paginaActual, establecerPaginaActual] = useState(1);

    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
    const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);

    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

    const [categoriaEditar, setCategoriaEditar] = useState({
        id_categoria: "",
        nombre_categoria: "",
        descripcion_categoria: "",
    });

    const manejoCambioInput = (e) => {
        const { name, value } = e.target;
        setNuevaCategoria((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // busqueda
    const manejarBusqueda = (e) => {
        setTextoBusqueda(e.target.value);
    };

    // busqueda
    const categoriasPaginadas = categoriasFiltradas.slice(
        (paginaActual - 1) * registrosPorPagina,
        paginaActual * registrosPorPagina
    );

    const agregarCategoria = async () => {
        try {
            if (
                !nuevaCategoria.nombre_categoria.trim() ||
                !nuevaCategoria.descripcion_categoria.trim()
            ) {
                setToast({
                    mostrar: true,
                    mensaje: "Debe llenar todos los campos.",
                    tipo: "advertencia",
                });
                return;
            }

            const { error } = await supabase.from("categorias").insert([
                {
                    nombre_categoria: nuevaCategoria.nombre_categoria,
                    descripcion_categoria: nuevaCategoria.descripcion_categoria,
                },
            ]);

            if (error) {
                setToast({ mostrar: true, mensaje: "Error al registrar categoría.", tipo: "error" });
                return;
            }

            setToast({
                mostrar: true,
                mensaje: `Categoría "${nuevaCategoria.nombre_categoria}" registrada exitosamente.`,
                tipo: "exito",
            });

            setNuevaCategoria({ nombre_categoria: "", descripcion_categoria: "" });
            setMostrarModal(false);
            await cargarCategorias();

        } catch {
            setToast({ mostrar: true, mensaje: "Error inesperado.", tipo: "error" });
        }
    };

    const actualizarCategoria = async () => {
        try {
            if (
                !categoriaEditar.nombre_categoria.trim() ||
                !categoriaEditar.descripcion_categoria.trim()
            ) {
                setToast({ mostrar: true, mensaje: "Debe llenar todos los campos.", tipo: "advertencia" });
                return;
            }

            setMostrarModalEdicion(false);

            const { error } = await supabase
                .from("categorias")
                .update({
                    nombre_categoria: categoriaEditar.nombre_categoria,
                    descripcion_categoria: categoriaEditar.descripcion_categoria,
                })
                .eq("id_categoria", categoriaEditar.id_categoria);

            if (error) {
                setToast({ mostrar: true, mensaje: "Error al actualizar.", tipo: "error" });
                return;
            }

            await cargarCategorias();

            setToast({
                mostrar: true,
                mensaje: `Categoría ${categoriaEditar.nombre_categoria} actualizada.`,
                tipo: "exito",
            });

        } catch {
            setToast({ mostrar: true, mensaje: "Error inesperado.", tipo: "error" });
        }
    };

    const eliminarCategoria = async () => {
        if (!categoriaAEliminar) return;

        try {
            setMostrarModalEliminacion(false);

            const { error } = await supabase
                .from("categorias")
                .delete()
                .eq("id_categoria", categoriaAEliminar.id_categoria);

            if (error) {
                setToast({ mostrar: true, mensaje: "Error al eliminar.", tipo: "error" });
                return;
            }

            await cargarCategorias();

            setToast({
                mostrar: true,
                mensaje: `Categoría ${categoriaAEliminar.nombre_categoria} eliminada.`,
                tipo: "exito",
            });

        } catch {
            setToast({ mostrar: true, mensaje: "Error inesperado.", tipo: "error" });
        }
    };

    const abrirModalEdicion = (categoria) => {
        setCategoriaEditar(categoria);
        setMostrarModalEdicion(true);
    };

    const abrirModalEliminacion = (categoria) => {
        setCategoriaAEliminar(categoria);
        setMostrarModalEliminacion(true);
    };

    const manejoCambioInputEdicion = (e) => {
        const { name, value } = e.target;
        setCategoriaEditar((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // FILTRO DE BUSQUEDA
    useEffect(() => {
        if (!textoBusqueda.trim()) {
            setCategoriasFiltradas(categorias);
        } else {
            const textoLower = textoBusqueda.toLowerCase().trim();

            const filtradas = categorias.filter(
                (cat) =>
                    cat.nombre_categoria.toLowerCase().includes(textoLower) ||
                    (cat.descripcion_categoria &&
                        cat.descripcion_categoria.toLowerCase().includes(textoLower))
            );

            setCategoriasFiltradas(filtradas);
        }
    }, [textoBusqueda, categorias]);

    const cargarCategorias = async () => {
        try {
            setCargando(true);
            const { data } = await supabase
                .from("categorias")
                .select("*")
                .order("id_categoria");

            setCategorias(data || []);
            setCategoriasFiltradas(data || []);
        } catch {
            setToast({ mostrar: true, mensaje: "Error al cargar.", tipo: "error" });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarCategorias();
    }, []);

    return (
        <Container className="mt-3">

            {/* HEADER */}
            <Row className="align-items-center mb-3">
                <Col xs={9}>
                    <h3 className="mb-0">Categorías</h3>
                </Col>
                <Col xs={3} className="text-end">
                    <Button onClick={() => setMostrarModal(true)}>
                        <i className="bi bi-plus-lg"></i>
                        <span className="d-none d-sm-inline ms-2">
                            Nueva Categoría
                        </span>
                    </Button>
                </Col>
            </Row>

            <hr />

            {/* BUSCADOR */}
            <Row className="mb-4">
                <Col md={6} lg={5}>
                    <CuadroBusquedas
                        textoBusqueda={textoBusqueda}
                        manejarCambioBusqueda={manejarBusqueda}
                        placeholder="Buscar por nombre o descripción..."
                    />
                </Col>
            </Row>

            {/* MENSAJE SIN RESULTADOS */}
            {!cargando && textoBusqueda.trim() && categoriasFiltradas.length === 0 && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="info" className="text-center">
                            <i className="bi bi-info-circle me-2"></i>
                            No se encontraron categorías que coincidan con "{textoBusqueda}".
                        </Alert>
                    </Col>
                </Row>
            )}

            

            {/* CONTENIDO */}
            {cargando ? (
                <div className="text-center my-5">
                    <Spinner animation="border" />
                </div>
            ) : categoriasFiltradas.length > 0 ? (

                <Row>

                    {/* TARJETAS */}
                    <Col xs={12} className="d-lg-none">
                        <TarjetaCategoria
                            categorias={categoriasFiltradas}
                            abrirModalEdicion={abrirModalEdicion}
                            abrirModalEliminacion={abrirModalEliminacion}
                        />
                    </Col>

                    {/* TABLA */}
                    <Col xs={12} className="d-none d-lg-block">
                        <TablaCategorias
                            categorias={categoriasFiltradas}
                            abrirModalEdicion={abrirModalEdicion}
                            abrirModalEliminacion={abrirModalEliminacion}
                        />
                    </Col>

                </Row>

            ) : (
                <p className="text-center">No hay categorías registradas</p>
            )}

            {/* Paginación */}
            {categoriasFiltradas.length > 0 && (
                <Paginacion
                    registrosPorPagina={registrosPorPagina}
                    totalRegistros={categoriasFiltradas.length}
                    paginaActual={paginaActual}
                    establecerPaginaActual={establecerPaginaActual}
                    establecerRegistrosPorPagina={establecerRegistrosPorPagina}
                />
            )}
            {/* MODALES */}
            <ModalRegistroCategoria
                mostrarModal={mostrarModal}
                setMostrarModal={setMostrarModal}
                nuevaCategoria={nuevaCategoria}
                manejoCambioInput={manejoCambioInput}
                agregarCategoria={agregarCategoria}
            />

            <ModalEdicionCategoria
                mostrarModalEdicion={mostrarModalEdicion}
                setMostrarModalEdicion={setMostrarModalEdicion}
                categoriaEditar={categoriaEditar}
                manejoCambioInputEdicion={manejoCambioInputEdicion}
                actualizarCategoria={actualizarCategoria}
            />

            <ModalEliminacionCategoria
                mostrarModalEliminacion={mostrarModalEliminacion}
                setMostrarModalEliminacion={setMostrarModalEliminacion}
                eliminarCategoria={eliminarCategoria}
                categoria={categoriaAEliminar}
            />

            {/* TOAST */}
            <NotificacionOperacion
                mostrar={toast.mostrar}
                mensaje={toast.mensaje}
                tipo={toast.tipo}
                onCerrar={() => setToast({ ...toast, mostrar: false })}
            />

        </Container>
    );
};

export default Categorias;