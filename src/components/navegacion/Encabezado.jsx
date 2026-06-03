import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Nav, Navbar, NavLink, Offcanvas } from "react-bootstrap";
import logo from "../../assets/logo.jpg";
import { supabase } from "../../database/supabaseconfig";
import "bootstrap-icons/font/bootstrap-icons.css";
import ChatIA from "../ia/ChatIA";



const NavbarModaExpress = () => {
    const [mostrarMenu, setMostrarMenu] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
const [mostrarChatIA, setMostrarChatIA] = useState(false);
    const manejarToggle = () => setMostrarMenu(!mostrarMenu);

    const manejarNavegacion = (ruta) => {
        navigate(ruta);
        setMostrarMenu(false);
    };

    // =========================
    //  MODO OSCURO
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
           <Nav className="ms-auto pe-2 align-items-md-center">

    {/* Menú principal */}
    <div className="d-flex flex-column flex-md-row align-items-md-center">

        <Nav.Link onClick={() => manejarNavegacion("/")}>
            Inicio
        </Nav.Link>

        <Nav.Link onClick={() => manejarNavegacion("/dashboard")}>
            Dashboard
        </Nav.Link>

        <Nav.Link onClick={() => manejarNavegacion("/categorias")}>
            Categorías
        </Nav.Link>

        <Nav.Link onClick={() => manejarNavegacion("/productos")}>
            Productos
        </Nav.Link>

        <Nav.Link onClick={() => manejarNavegacion("/ventas")}>
            Ventas
        </Nav.Link>

        <Nav.Link onClick={() => manejarNavegacion("/catalogo")}>
            Catálogo
        </Nav.Link>

        <Nav.Link onClick={() => manejarNavegacion("/empleados")}>
            Empleados
        </Nav.Link>

        <Nav.Link onClick={() => manejarNavegacion("/clientes")}>
            Clientes
        </Nav.Link>

        {/* Chat IA */}
        <Nav.Link
            onClick={() => setMostrarChatIA(true)}
            className="ms-md-3"
        >
            <i className="bi bi-robot"></i>
        </Nav.Link>

    </div>

    <div className="vr mx-3 d-none d-md-block"></div>

    {/* Opciones */}
    <div className="d-flex flex-column flex-md-row align-items-md-center">

    <Nav.Link
        onClick={toggleDarkMode}
        className="me-md-2"
        title={isDarkMode ? "Modo claro" : "Modo oscuro"}
    >
        <i className={`bi ${isDarkMode ? "bi-sun-fill" : "bi-moon-fill"}`}></i>
    </Nav.Link>

    <Nav.Link onClick={cerrarSesion}>
        Salir
    </Nav.Link>

</div>

    <ChatIA
        mostrar={mostrarChatIA}
        onCerrar={() => setMostrarChatIA(false)}
    />

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