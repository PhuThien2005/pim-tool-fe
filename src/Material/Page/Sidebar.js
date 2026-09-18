import React from "react";
import Translate from "react-translate-component";
import { Row, Col, Nav, Navbar } from "react-bootstrap";
import "../Style/Navigation.css";
import counterpart from "counterpart";
import en from "../lang/en";
import { Link, NavLink } from "react-router-dom";

counterpart.registerTranslations("en", en);

function Sidebar() {
  return (
    <Navbar collapseOnSelect expand="lg">
      <Navbar.Brand />
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="navigation">
          <Row>
            <Col xl={12}>
              <Nav.Link as={Link} to="/">
                <p className="text-semi-bold first-element">
                  <Translate content="navigation.title" />
                </p>
              </Nav.Link>
              <Nav.Link>
                <p className="text-semi-bold">
                  <Translate content="navigation.new" />
                </p>
              </Nav.Link>
              <Nav.Link as={Link} to="/create-project">
                <Translate content="navigation.project" />
              </Nav.Link>
              <Nav.Link href="/customer">
                <Translate content="navigation.customer" />
              </Nav.Link>
              <Nav.Link href="/supplier">
                <Translate content="navigation.supplier" />
              </Nav.Link>
            </Col>
          </Row>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Sidebar;
