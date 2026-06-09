import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Spinner, Form, Button } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { supabase } from "../database/supabaseconfig";


const Inicio = () => {
    // ============================
    // ESTADOS
    // ============================

    const [cargando, setCargando] = useState(true);

    const [fechaDesde, setFechaDesde] = useState(
        new Date().toLocaleDateString("en-CA", {
            timeZone: "America/Managua",
        })
    );

    const [fechaHasta, setFechaHasta] = useState(
        new Date().toLocaleDateString("en-CA", {
            timeZone: "America/Managua",
        })
    );

    const [estadisticas, setEstadisticas] = useState({
        totalVentas: 0,
        ventasEfectivo: 0,
        ventasTarjeta: 0,
        productosVendidos: 0,
        montoProductos: 0,
        cantidadVentas: 0,
        ventasPorHora: [],
        ventasPorCategoria: [],
    });

    //nose
    const graficoHoraRef = useRef(null);
    const graficoCategoriaRef = useRef(null);

    //generar Excel
    const descargarExcel = () => {
    try {
        const datosResumen = [
            {
                "Total Ventas": estadisticas.totalVentas,
                "Ventas Efectivo": estadisticas.ventasEfectivo,
                "Ventas Tarjeta": estadisticas.ventasTarjeta,
                "Productos Vendidos": estadisticas.productosVendidos,
                "Cantidad Ventas": estadisticas.cantidadVentas,
            },
        ];

        const datosHoras = estadisticas.ventasPorHora.map((item) => ({
            Hora: item.hora,
            "Monto Acumulado": item.total,
        }));

        const datosCategorias = estadisticas.ventasPorCategoria.map((item) => ({
            Categoria: item.name,
            Total: item.value,
        }));

        const wb = XLSX.utils.book_new();

        const wsResumen = XLSX.utils.json_to_sheet(datosResumen);
        XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

        const wsHoras = XLSX.utils.json_to_sheet(datosHoras);
        XLSX.utils.book_append_sheet(wb, wsHoras, "Ventas por Hora");

        const wsCategorias = XLSX.utils.json_to_sheet(datosCategorias);
        XLSX.utils.book_append_sheet(wb, wsCategorias, "Categorias");

        const fechaActual = new Date().toLocaleDateString("en-CA", {
            timeZone: "America/Managua",
        });

        XLSX.writeFile(
            wb,
            `Reporte_Ventas_${fechaDesde}_${fechaHasta}_${fechaActual}.xlsx`
        );
    } catch (error) {
        console.error(error);
        alert("Error al generar Excel");
    }
};


    // generar Pdf
    const generarPdfVentasHora = async () => {
        try {

            const pdf = new jsPDF("p", "mm", "a4");

            //Título y fecha
            pdf.setFontSize(18);
            pdf.setTextColor("#330775");
            pdf.setFont("helvetica", "bold");
            pdf.text("Reporte de Ventas por Hora", 14, 15);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor("#000000");
            pdf.setFontSize(10);
            pdf.text(`Periodo: ${fechaDesde} - ${fechaHasta}`, 14, 22);

            // Imagen del gráfico
            const canvas = await html2canvas(graficoHoraRef.current);
            const imagen = canvas.toDataURL("image/png");
            pdf.addImage(imagen, "PNG", 10, 30, 190, 80);

            // Resumen general
            pdf.setFontSize(14);
            pdf.setTextColor("#330775");
            pdf.setFont("helvetica", "bold");
            pdf.text("Resumen General", 14, 115);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor("#000000");
            pdf.setFontSize(10);

            pdf.text(`Total Ventas: C$ ${estadisticas.totalVentas.toFixed(2)}`, 14, 125);
            pdf.text(`Ventas Efectivo: C$ ${estadisticas.ventasEfectivo.toFixed(2)}`, 14, 132);
            pdf.text(`Ventas Tarjeta: C$ ${estadisticas.ventasTarjeta.toFixed(2)}`, 14, 139);
            pdf.text(`Productos Vendidos: ${estadisticas.productosVendidos}`, 14, 146);
            pdf.text(`Cantidad Ventas: ${estadisticas.cantidadVentas}`, 14, 153);

            // Tabla de ventas por hora
            const filas = estadisticas.ventasPorHora.map(item => [
                item.hora,
                `C$ ${item.total}`
            ]);

            autoTable(pdf, {
                startY: 160,
                head: [["Hora", "Monto Acumulado"]],
                body: filas
            });

            // Descargar PDF
            const fechaActual = new Date().toLocaleDateString("en-CA", {
                timeZone: "America/Managua"
            });

            pdf.save(
                `VentasHora_${fechaDesde}_${fechaHasta}_Generado_${fechaActual}.pdf`
            );

        } catch (error) {
            console.error(error);
            alert("Error generando PDF");
        }
    };



    // ============================
    // USE EFFECT
    // ============================

    useEffect(() => {
        cargarDatos(fechaDesde, fechaHasta);
    }, [fechaDesde, fechaHasta]);

    // ============================
    // CARGAR DATOS
    // ============================

    const cargarDatos = async (desde, hasta) => {
        try {
            setCargando(true);

            const inicioRango = `${desde} 00:00:00`;
            const finRango = `${hasta} 23:59:59`;

            const { data: ventas, error } = await supabase
                .from("ventas")
                .select("id_venta, total, fecha_venta, metodo_pago")
                .gte("fecha_venta", inicioRango)
                .lte("fecha_venta", finRango);

            if (error) throw error;

            const idsVentas = ventas?.map((v) => v.id_venta) || [];

            let productosVendidos = 0;
            let montoProductos = 0;
            let ventasPorCategoria = [];

            if (idsVentas.length > 0) {
                const { data: detalles } = await supabase
                    .from("detalles_ventas")
                    .select(`
            cantidad,
            subtotal,
            productos (
              nombre_producto,
              categorias (nombre_categoria)
            )
          `)
                    .in("id_venta", idsVentas);

                detalles?.forEach((d) => {
                    productosVendidos += d.cantidad || 0;
                    montoProductos += d.subtotal || 0;

                    const categoria =
                        d.productos?.categorias?.nombre_categoria ||
                        "Sin categoría";

                    const existente = ventasPorCategoria.find(
                        (c) => c.name === categoria
                    );

                    if (existente) {
                        existente.value += d.subtotal || 0;
                    } else {
                        ventasPorCategoria.push({
                            name: categoria,
                            value: d.subtotal || 0,
                        });
                    }
                });

                ventasPorCategoria.sort((a, b) => b.value - a.value);
            }

            const totalVentas =
                ventas?.reduce((sum, v) => sum + (v.total || 0), 0) || 0;

            const ventasEfectivo =
                ventas
                    ?.filter((v) => v.metodo_pago === "efectivo")
                    .reduce((sum, v) => sum + (v.total || 0), 0) || 0;

            const ventasTarjeta =
                ventas
                    ?.filter((v) => v.metodo_pago === "tarjeta")
                    .reduce((sum, v) => sum + (v.total || 0), 0) || 0;

            const horaMap = Array(24).fill(0);

            ventas?.forEach((venta) => {
                if (!venta.fecha_venta) return;

                const hora = new Date(venta.fecha_venta).getHours();

                if (hora >= 0 && hora < 24) {
                    horaMap[hora] += venta.total || 0;
                }
            });

            const ventasPorHora = [];
            let acumulado = 0;

            for (let h = 8; h <= 22; h++) {
                acumulado += horaMap[h];

                ventasPorHora.push({
                    hora: `${h.toString().padStart(2, "0")}:00`,
                    total: Math.round(acumulado),
                });
            }

            setEstadisticas({
                totalVentas,
                ventasEfectivo,
                ventasTarjeta,
                productosVendidos,
                montoProductos,
                cantidadVentas: ventas?.length || 0,
                ventasPorHora,
                ventasPorCategoria,
            });
        } catch (err) {
            console.error("Error al cargar estadísticas:", err);
        } finally {
            setCargando(false);
        }
    };

    // ============================
    // COLORES
    // ============================

    const COLORES = [
        "#5e26b2",
        "#39ff95",
        "#ff6bc6",
        "#8b46ff",
        "#00d4ff",
        "#ffd93d",
    ];

    // ============================
    // LOADING
    // ============================

    if (cargando) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Cargando estadísticas...</p>
            </Container>
        );
    }

    // ============================
    // VISTA
    // ============================

    return (
        <Container fluid>
            return (
            <Container fluid>
                <div className="mt-2">
                    <div className="mb-4">
                        <h2>Dashboard</h2>
                        <h6>Estadísticas del Negocio</h6>
                    </div>

                    <Row className="mb-4">
                        <Col xs={12} md={3}>
                            <Form.Group>
                                <Form.Label>Desde</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fechaDesde}
                                    onChange={(e) => setFechaDesde(e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        <Col xs={12} md={3}>
                            <Form.Group>
                                <Form.Label>Hasta</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fechaHasta}
                                    onChange={(e) => setFechaHasta(e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6} className="d-flex align-items-end gap-2">
                            <Button variant="success" onClick={descargarExcel}>
                                <i className="bi bi-file-earmark-excel me-2"></i>
                                Excel
                            </Button>

                            <Button
                                variant="danger"
                                onClick={generarPdfVentasHora}
                            >
                                <i className="bi bi-file-earmark-pdf me-2"></i>
                                PDF
                            </Button>
                        </Col>
                    </Row>

                    {/* Tarjetas */}
                    <Row className="g-4 mb-5">
                        <Col md={6} lg={3}>
                            <Card
                                className="h-100 text-white shadow"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #28a745, #34ce57)"
                                }}
                            >
                                <Card.Body>
                                    <h5>Ventas Totales</h5>
                                    <h2>
                                        C$ {Number(estadisticas.totalVentas).toFixed(2)}
                                    </h2>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6} lg={3}>
                            <Card
                                className="h-100 text-white shadow"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #0166d3, #3399ff)"
                                }}
                            >
                                <Card.Body>
                                    <h5>Efectivo</h5>
                                    <h2>
                                        C$ {Number(estadisticas.ventasEfectivo).toFixed(2)}
                                    </h2>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6} lg={3}>
                            <Card
                                className="h-100 text-white shadow"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #5ea5f1, #94c0ec)"
                                }}
                            >
                                <Card.Body>
                                    <h5>Tarjeta</h5>
                                    <h2>
                                        C$ {Number(estadisticas.ventasTarjeta).toFixed(2)}
                                    </h2>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6} lg={3}>
                            <Card
                                className="h-100 text-white shadow"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #e27d01, #ffa500)"
                                }}
                            >
                                <Card.Body>
                                    <h5>Productos Vendidos</h5>
                                    <h2>{estadisticas.productosVendidos}</h2>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Gráficos */}
                   {/* Gráficos */}
<Row className="g-4">

    {/* Gráfico de Línea */}
    <Col lg={8}>
        <Card className="shadow border-0">
            <Card.Body ref={graficoHoraRef}>
                <h5 className="mb-3">Ventas por Hora</h5>

                <ResponsiveContainer width="100%" height={360}>
                    <LineChart data={estadisticas.ventasPorHora}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hora" />
                        <YAxis tickFormatter={(v) => `C$${v}`} />
                        <Tooltip formatter={(v) => [`C$ ${v}`, "Monto"]} />
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke="#5e26b2"
                            strokeWidth={4}
                            dot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card.Body>
        </Card>
    </Col>

    {/* Gráfico de Dona */}
    <Col lg={4}>
        <Card
            className="shadow border-0"
            ref={graficoCategoriaRef}
        >
            <Card.Body>
                <h5 className="mb-3">Ventas por Categoría</h5>

                <ResponsiveContainer width="100%" height={360}>
                    <PieChart>
                        <Pie
                            data={
                                estadisticas.ventasPorCategoria.length > 0
                                    ? estadisticas.ventasPorCategoria
                                    : [{ name: "Sin datos", value: 1 }]
                            }
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={110}
                            label
                        >
                            {(estadisticas.ventasPorCategoria.length > 0
                                ? estadisticas.ventasPorCategoria
                                : [{ name: "Sin datos", value: 1 }]
                            ).map((_, i) => (
                                <Cell
                                    key={i}
                                    fill={COLORES[i % COLORES.length]}
                                />
                            ))}
                        </Pie>

                        <Tooltip formatter={(v) => `C$ ${v}`} />
                    </PieChart>
                </ResponsiveContainer>
            </Card.Body>
        </Card>
    </Col>

</Row>
                </div>
            </Container>
            );
        </Container>
    );
};

export default Inicio;