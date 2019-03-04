import React from 'react';
import PropTypes from 'prop-types';
import PreviewCompatibleImage from '../components/PreviewCompatibleImage';

import { Link } from 'gatsby';

const FeatureGrid = ({ gridItems }) => (
  <div className="columns is-multiline">
    {gridItems.map(item => (
      <div key={item.text} className="column is-6">
        <section className="section">
          <div className="has-text-centered">
            <div
              style={{
                width: '200px',
                height: '220px',
                display: 'inline-block'
              }}
            >
              <PreviewCompatibleImage imageInfo={item} />
            </div>
          </div>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
          <Link className="btn" to={item.link}>
            En savoir plus...
          </Link>
        </section>
      </div>
    ))}
  </div>
);

FeatureGrid.propTypes = {
  gridItems: PropTypes.arrayOf(
    PropTypes.shape({
      image: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
      text: PropTypes.string,
      title: PropTypes.string
    })
  )
};

export default FeatureGrid;
