import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Nav, Navbar, NavLink, Offcanvas } from "react-bootstrap";
import logo from "../../assets/logo.jpg";
import { supabase } from "../../database/supabaseconfig";
import "bootstrap-icons/font/bootstrap-icons.css";

const NavbarModaExpress = () => {
    const [mostrarMenu, setMostrarMenu] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    const manejarToggle = () => setMostrarMenu(!mostrarMenu);

    const manejarNavegacion = (ruta) => {
        navigate(ruta);
        setMostrarMenu(false);
    };

    // =========================
    // 🌙 MODO OSCURO
    // =========================
    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem("darkMode", newMode.toString());
        document.documentElement.setAttribute(
            "data-bs-theme",
            newMode ? "dark" : "light"
        );
    };

    useEffect(() => {
        const savedMode = localStorage.getItem("darkMode");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        const shouldBeDark =
            savedMode !== null ? savedMode === "true" : prefersDark;

        setIsDarkMode(shouldBeDark);
        document.documentElement.setAttribute(
            "data-bs-theme",
            shouldBeDark ? "dark" : "light"
        );
    }, []);

    const cerrarSesion = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            localStorage.removeItem("usuario-supabase");
            setMostrarMenu(false);
            navigate("/login");
        } catch (err) {
            console.error("Error cerrando sesión:", err.message);
        }
    };

    const esLogin = location.pathname === "/login";
    const esCatalogo =
        location.pathname === "/catalogo" &&
        localStorage.getItem("usuario-supabase") === null;

    let contenidoMenu;

    if (esLogin) {
        contenidoMenu = (
            <Nav className="ms-auto pe-2">
                <Nav.Link onClick={() => manejarNavegacion("/login")}>
                    <i className="bi bi-person-fill-lock me-2"></i>
                    Iniciar sesión
                </Nav.Link>
            </Nav>
        );
    } else if (esCatalogo) {
        contenidoMenu = (
            <Nav className="ms-auto pe-2">
                <Nav.Link onClick={() => manejarNavegacion("/catalogo")}>
                    <i className="bi bi-images me-2"></i>
                    <strong>Catálogo</strong>
                </Nav.Link>
            </Nav>
        );
    } else {
        contenidoMenu = (
            <Nav className="ms-auto pe-2">

                <Nav.Link onClick={() => manejarNavegacion("/")}>
                    <i className="bi bi-house-fill me-2"></i>
                    <strong>Inicio</strong>
                </Nav.Link>

                <Nav.Link onClick={() => manejarNavegacion("/categorias")}>
                    <i className="bi bi-bookmark-fill me-2"></i>
                    <strong>Categorías</strong>
                </Nav.Link>

                <Nav.Link onClick={() => manejarNavegacion("/productos")}>
                    <i className="bi bi-bag-heart-fill me-2"></i>
                    <strong>Productos</strong>
                </Nav.Link>

                <Nav.Link onClick={() => manejarNavegacion("/catalogo")}>
                    <i className="bi bi-images me-2"></i>
                    <strong>Catálogo</strong>
                </Nav.Link>

                <Nav.Link onClick={() => manejarNavegacion("/empleados")}>
                    <i className="bi bi-images me-2"></i>
                    <strong>Empleados</strong>
                </Nav.Link>

                {/* 🌙 MODO OSCURO */}
                <Nav.Link onClick={toggleDarkMode}>
                    <i className={`bi ${isDarkMode ? "bi-sun" : "bi-moon"} me-2`}></i>
                    <strong>{isDarkMode ? "Claro" : "Oscuro"}</strong>
                </Nav.Link>

                <NavLink onClick={cerrarSesion}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                </NavLink>

                <hr />

                {mostrarMenu && (
                    <div className="mt-3 p-3 rounded bg-body-secondary text-body">
                        <p className="mb-2">
                            <i className="bi bi-envelope-fill me-2"></i>
                            {localStorage.getItem("usuario-supabase") || "Usuario"}
                        </p>

                        <button
                            className="btn btn-outline-danger w-100"
                            onClick={cerrarSesion}
                        >
                            <i className="bi bi-box-arrow-right me-2"></i>
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </Nav>
        );
    }

    return (
        <Navbar
            expand="md"
            fixed="top"
            className="color-navbar shadow-lg"
            variant="dark"
        >
            <Container>

                <Navbar.Brand
                    onClick={() => manejarNavegacion(esCatalogo ? "/catalogo" : "/")}
                    className="text-white fw-bold d-flex align-items-center"
                    style={{ cursor: "pointer" }}
                >
                    <img
                        src={logo}
                        width="45"
                        height="45"
                        className="me-2"
                        alt="logo"
                    />
                    <h4 className="mb-0">Moda Express</h4>
                </Navbar.Brand>

                {!esLogin && (
                    <Navbar.Toggle onClick={manejarToggle} />
                )}

                <Navbar.Offcanvas
                    placement="end"
                    show={mostrarMenu}
                    onHide={() => setMostrarMenu(false)}
                >
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>Menú Moda Express</Offcanvas.Title>
                    </Offcanvas.Header>

                    <Offcanvas.Body>
                        {contenidoMenu}
                    </Offcanvas.Body>
                </Navbar.Offcanvas>

            </Container>
        </Navbar>
    );
};

export default NavbarModaExpress;