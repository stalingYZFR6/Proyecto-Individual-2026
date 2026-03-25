import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
const Pagina404 = () => {
    return (
        <Container className="mt-3">
            <Row className="align-items-center">
                <Col>
                    <h2><i className="bi-house-fill me-2"></i> 404 not found</h2>
                </Col>
            </Row>
        </Container>
    );
};
export default Pagina404;