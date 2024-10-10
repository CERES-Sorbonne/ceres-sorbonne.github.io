import { Link } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import * as React from 'react'
import { Tag } from "./layout"


export const LongCard = ({ postData, toggleTag, selectedTags }) => {
    const { date, slug, image, collection } = postData.fields
    const { title, tags, abstract, sound, uuid, prettyName } = postData.frontmatter

    return (
        <div className="long-card">
            <Link className="card-link" to={`/${prettyName ? prettyName : uuid}`} />
            {image ? (<GatsbyImage className="image-card" image={getImage(image)} alt={title} />) : (<div className="image-card" />)}
            <div className="description">
                <h4>{title}</h4>
                {
                    sound && (
                        <audio controls>
                            <source src={sound} type="audio/wav" />
                        </audio>
                    )
                }
                {date && (
                    <div className="card-details">
                        <time dateTime={date}>{date}</time> • <Link className="section-name" to={`/${collection}`}>{collection}</Link>
                    </div>)}
                {tags && (<div className="small-tags-container">
                    {tags ? tags.map(t => <Tag tagName={t} selectedTags={selectedTags} toggleTag={toggleTag} />) : ""}
                </div>)}
                <p className="text-sample">
                    {abstract ? abstract : postData.excerpt}
                </p>
            </div>
        </div>
    )
}
