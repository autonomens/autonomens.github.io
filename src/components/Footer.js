import React from 'react';
import { Link } from 'gatsby';

import logo from '../img/logo-header.svg';

const Footer = class extends React.Component {
  render() {
    return (
      <footer className="footer has-background-black has-text-white-ter">
        <div className="content has-text-centered">
          <img
            src={logo}
            alt="Autonomens"
            style={{ width: '30em', height: '10em' }}
          />
        </div>
        <div className="content has-text-centered has-background-black has-text-white-ter">
          <div className="container has-background-black has-text-white-ter">
            <div className="columns">
              <div className="column is-6">
                <section className="menu">
                  <ul className="menu-list">
                    <li>
                      <Link to="/" className="navbar-item">
                        Accueil
                      </Link>
                    </li>
                    <li>
                      <Link className="navbar-item" to="/login">
                        Se connecter
                      </Link>
                    </li>
                  </ul>
                </section>
              </div>
              <div className="column is-6">
                <section>
                  <ul className="menu-list">
                    <li>               
                      <a title="twitter" href="https://twitter.com/datatheca">
                        <img
                          className="fas fa-lg"
                          src="/img/twitter.svg"
                          alt="Twitter"
                          style={{ width: '1em', height: '1em' }}
                        />
                      </a>
                    </li>
                    <li>
                      <Link className="navbar-item" to="/contact">
                        Contact
                      </Link>
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }
};



export default Footer;
