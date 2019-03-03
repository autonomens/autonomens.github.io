import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'gatsby';

export default () => (
  <Layout>
    <section className="section">
      <div className="container">
        <div className="content">
          <h1>Connection impossible!</h1>
          <p>Veuillez vérifier vos identifiants.</p>
          <Link className="btn" to="/login">
            Retour
          </Link>
        </div>
      </div>
    </section>
  </Layout>
);
