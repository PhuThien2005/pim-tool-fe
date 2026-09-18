import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ErrorScreen from "./ErrorScreen";
import Project from "./Project";

function MainPage() {
  const routes = [
    {
      path: "/create-project",
      main: () => <Project />,
    },
  ];

  return (
    <div className="main">
      <Container fluid>
        <Row>
          <Col>
            <Header />
          </Col>
        </Row>

        <Router>
          <Row>
            <Col xl={1} />
            <Col xl={2}>
              <Sidebar />
            </Col>
            <Col xl={9}>
              {routes.map((route, index) => {
                return (
                  <Route
                    key={index}
                    path={route.path}
                    exact={route.exact}
                    children={<route.main />}
                  />
                );
              })}
            </Col>
            <Col>
              <Route path="/error" component={ErrorScreen} />
            </Col>
          </Row>
        </Router>
      </Container>
    </div>
  );
}

export default MainPage;
