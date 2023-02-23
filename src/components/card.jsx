import { Tag } from "./layout"
import { Link } from "gatsby"
import * as React from 'react'


export const Card = ({ postData, toggleTag, selectedTags }) => {
    const { date, slug, image, collection } = postData.fields
    const { title, tags, abstract, sound } = postData.frontmatter

    return (
        <div className="card">
            <Link className="card-link" to={`/${collection}/` + slug} />
            {(<img src={image?.publicURL} />)}
            <h4>{title}</h4>
            {tags && (<div class="small-tags-container">
                {tags ? tags.map(t => <Tag tagName={t} selectedTags={selectedTags} toggleTag={toggleTag} />) : ""}
            </div>)}
            <p className="date">
                <time datetime={date}>{date}</time>
            </p>
            <p class="text-sample">
                {abstract ? abstract : postData.excerpt}
            </p>
        </div>
    )
}