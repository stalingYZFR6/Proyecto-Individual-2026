import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../components/categorias/ModalEliminacionCategoria";
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaCategorias from "../components/categorias/TablaCategorias";

const Categorias = () => {

    const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
    const [mostrarModal, setMostrarModal] = useState(false);

    const [nuevaCategoria, setNuevaCategoria] = useState({
        nombre_categoria: "",
        descripcion_categoria: "",
    });

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
                console.error("Error al agregar categoría:", error.message);
                setToast({
                    mostrar: true,
                    mensaje: "Error al registrar categoría.",
                    tipo: "error",
                });
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

        } catch (err) {
            console.error("Excepción al agregar categoría:", err.message);
            setToast({
                mostrar: true,
                mensaje: "Error inesperado al registrar categoría.",
                tipo: "error",
            });
        }
    };

    // 🔥 AQUÍ VA LA FUNCIÓN DE ACTUALIZAR
    const actualizarCategoria = async () => {
        try {
            if (
                !categoriaEditar.nombre_categoria.trim() ||
                !categoriaEditar.descripcion_categoria.trim()
            ) {
                setToast({
                    mostrar: true,
                    mensaje: "Debe llenar todos los campos.",
                    tipo: "advertencia",
                });
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
                console.error("Error al actualizar categoría:", error.message);
                setToast({
                    mostrar: true,
                    mensaje: `Error al actualizar la categoría ${categoriaEditar.nombre_categoria}.`,
                    tipo: "error",
                });
                return;
            }

            await cargarCategorias();

            setToast({
                mostrar: true,
                mensaje: `Categoría ${categoriaEditar.nombre_categoria} actualizada exitosamente.`,
                tipo: "exito",
            });

        } catch (err) {
            setToast({
                mostrar: true,
                mensaje: "Error inesperado al actualizar categoría.",
                tipo: "error",
            });
            console.error("Excepción al actualizar categoría:", err.message);
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
                console.error("Error al eliminar categoría:", error.message);
                setToast({
                    mostrar: true,
                    mensaje: `Error al eliminar la categoría ${categoriaAEliminar.nombre_categoria}.`,
                    tipo: "error",
                });
                return;
            }

            await cargarCategorias();

            setToast({
                mostrar: true,
                mensaje: `Categoría ${categoriaAEliminar.nombre_categoria} eliminada exitosamente.`,
                tipo: "exito",
            });

        } catch (err) {
            setToast({
                mostrar: true,
                mensaje: "Error inesperado al eliminar categoría.",
                tipo: "error",
            });
            console.error("Excepción al eliminar categoría:", err.message);
        }
    };

    const abrirModalEdicion = (categoria) => {
        setCategoriaEditar({
            id_categoria: categoria.id_categoria,
            nombre_categoria: categoria.nombre_categoria,
            descripcion_categoria: categoria.descripcion_categoria,
        });
        setMostrarModalEdicion(true);
    };

    const manejoCambioInputEdicion = (e) => {
        const { name, value } = e.target;
        setCategoriaEditar((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const abrirModalEliminacion = (categoria) => {
        setCategoriaAEliminar(categoria);
        setMostrarModalEliminacion(true);
    };

    const cargarCategorias = async () => {
        try {
            setCargando(true);
            const { data, error } = await supabase
                .from("categorias")
                .select("*")
                .order("id_categoria", { ascending: true });

            if (error) {
                console.error("Error al cargar categorías:", error.message);
                setToast({
                    mostrar: true,
                    mensaje: "Error al cargar categorías.",
                    tipo: "error",
                });
                return;
            }

            setCategorias(data || []);
        } catch (err) {
            console.error("Excepción al cargar categorías:", err.message);
            setToast({
                mostrar: true,
                mensaje: "Error inesperado al cargar categorías.",
                tipo: "error",
            });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarCategorias();
    }, []);

    return (
        <Container className="mt-3">

            <Row className="align-items-center mb-3">
                <Col xs={9}>
                    <h3 className="mb-0">Categorías</h3>
                </Col>
                <Col xs={3} className="text-end">
                    <Button onClick={() => setMostrarModal(true)}>
                        Nueva Categoría
                    </Button>
                </Col>
            </Row>

            <hr />

            {cargando && <Spinner />}

            {!cargando && categorias.length > 0 && (
                <TablaCategorias
                    categorias={categorias}
                    abrirModalEdicion={abrirModalEdicion}
                    abrirModalEliminacion={abrirModalEliminacion}
                />
            )}

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

            {/* MODAL DE EDICIÓN AGREGADO */}
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