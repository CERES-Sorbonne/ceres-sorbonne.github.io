import { Link } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import * as React from 'react'
import { Tag } from "./layout"


export const Card = ({ postData, toggleTag, selectedTags }) => {
    const { date, slug, image, collection } = postData.fields
    const { title, tags, abstract, uuid, prettyName } = postData.frontmatter
    const content = abstract ? abstract : postData.excerpt

    return (
        <div className="small-card">
            <Link className="card-link" to={`/${prettyName ? prettyName : uuid}`} />
            {image ? (<GatsbyImage className="image-card" image={getImage(image)} alt={title} />) : (<div className="image-card" />)}
            <h4>{title}</h4>
            <div className="card-details">
                <time dateTime={date}>{date}</time> • <Link className="section-name" to={`/${collection}`}>{collection}</Link>
            </div>
            {tags && (<div className="small-tags-container">
                {tags ? tags.map(t => <Tag tagName={t} selectedTags={selectedTags} toggleTag={toggleTag} />) : ""}
            </div>)}
            <p className="text-sample">
                {content}
            </p>
        </div>
    )
}
