import { Link, graphql } from "gatsby"
import * as React from 'react'
import Layout from '../components/layout'
import '../style/article.css'


function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const BlogPost = ({ data, children }) => {
    const date = data.markdownRemark.fields.date
    const { author, title, tags, abstract, sound } = data.markdownRemark.frontmatter
    const authorName = author ? data.site.siteMetadata.authors.filter(el => author.includes(el.id)).map(el => el.name).join(' & ') : ""
    React.useEffect(() => {
      document.querySelector('body').style.setProperty('--random-rotate', `${getRandomIntInclusive(20, 340)}deg`) 
    }, []);
    return (
        <Layout>
            <main>
                {data.markdownRemark.tableOfContents && (<div id="toc-container">
                    <nav dangerouslySetInnerHTML={{ __html: data.markdownRemark.tableOfContents }} />
                </div>)
                }
                    <header id="article-header">
                        <div className="overlay"> 
                          <h1>{title}</h1>
                          {author && date && (<span id="article-meta">Publié par {authorName} le {date}</span>)}
                          <button className="button print" onClick={() => { window.print(); }}>&darr; Enregistrer au format pdf</button>
                          {tags && (<div id="tags-container">
                              {tags ? tags.map((el, i) => <a className="tag" key={i} >{el}</a>) : ''}
                          </div>)}
                        </div>
                        {/* <img id="landing-image" src={Planet} style={{ maxWidth: "100%", margin: 0 }} /> */}
                    </header>
                <div id="article-container">
                    <article id="article">
                        {abstract ? <aside><p>{abstract}</p></aside> : ''}
                        {
                            sound && (
                                <audio controls>
                                    <source src={sound} type="audio/wav" />
                                </audio>
                            )
                        }
                        <section dangerouslySetInnerHTML={{ __html: data.markdownRemark.html }} />
                    </article>
                </div>
            </main>
        </Layout>
    )
}

export const query = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title,
        authors {
          id,
          name
        }
      }
    }
    markdownRemark(fields: {slug: {eq: $slug}}) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        author
        title
        tags
        abstract
        sound
        uuid
        prettyName
      }
      fields {
        date(formatString: "DD MMMM, YYYY", locale: "fr")
        slug
        collection
      }
      tableOfContents
    }
  }
`

export default BlogPost
