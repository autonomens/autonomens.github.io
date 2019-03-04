import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import Layout from '../components/Layout'
import Content, { HTMLContent } from '../components/Content'
import PreviewCompatibleImage from '../components/PreviewCompatibleImage';

export const ThemePageTemplate = ({ title, content, image, contentComponent }) => {
  const PageContent = contentComponent || Content

  return (
    <section className="section section--gradient">
      <div className="container">
        <div className="columns">
          <div className="column is-10 is-offset-1">
              {/*<div style={{
                width: '100%',
                height: '200px',
                margin: '30px', 
                display: 'flex', 
                flexDirection:'column',
                justifyContent:'center'
              }}>
                <PreviewCompatibleImage imageInfo={{image: image}}/>
            </div>*/}
              <h2 className="title is-size-3 has-text-weight-bold is-bold-light">
                {title}
              </h2>
              <PageContent className="content" content={content} />
          </div>
        </div>
      </div>
    </section>
  )
}

ThemePageTemplate.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string,
  contentComponent: PropTypes.func,
}

const ThemePage = ({ data }) => {
  const { markdownRemark: post } = data

  return (
    <Layout>
      <ThemePageTemplate
        contentComponent={HTMLContent}
        title={post.frontmatter.title}
        content={post.html}
        image={post.frontmatter.image}
      />
    </Layout>
  )
}

ThemePage.propTypes = {
  data: PropTypes.object.isRequired,
}

export default ThemePage

export const themePageQuery = graphql`
  query ThemePage($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        title
        image {
          childImageSharp {
            fluid(maxWidth: 2048, quality: 100) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
  }
`
