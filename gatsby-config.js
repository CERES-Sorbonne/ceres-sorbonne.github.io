const fs = require('fs')
const path = require('path')

const DIR = './src/data'
const folders = fs.readdirSync(DIR)

let config = {
  siteMetadata: {
    title: `CERES Sorbonne Université`,
    siteUrl: `https://ceres.sorbonne-universite.fr`,
    authors: [
      { id: `thomas`, name: `Thomas Bottini` },
      { id: `felix`, name: `Félix Alié` },
      { id: `edouard`, name: `Édouard Bouté` },
      { id: `gael`, name: `Gaël Lejeune` },
      { id: `virginie`, name: `Virginie Julliard` },
      { id: `thibault`, name: `Thibault Grison` },
      { id: `clara`, name: `Clara Bordier` },
      { id: `lea`, name: `Léa Andolfi` },
      { id: `rimane`, name: `Rimane Karam` },
      { id: `julien`, name: `Julien Bezançon` },
      { id: `victor`, name: `Victor Ecrement` },
      { id: `marceau`, name: `Marceau Hernandez` },
      { id: `gm`, name: `Gaël Lejeune & Marceau Hernandez` },
      { id: `ceres`, name: `L'équipe CERES` }
    ],
    pages: []
  },
  plugins: [
    "gatsby-plugin-emotion",
    "gatsby-plugin-image",
    "gatsby-plugin-sitemap", {
      resolve: 'gatsby-plugin-manifest',
      options: {
        "icon": "src/images/eclipse.svg"
      }
    },
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        footnotes: true,
        plugins: [
          // `gatsby-remark-copy-linked-files`,
          {
            resolve: `gatsby-remark-copy-linked-files`,
            options: {
              ignoreFileExtensions: []
            }
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            // options: {
            //   wrapperStyle: `margin-bottom: 1.0725rem`,
            // },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-smartypants`,
          `gatsby-remark-autolink-headers`
        ],
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        "name": "images",
        "path": "./src/images/"
      },
      __key: "images"
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        "name": "outils",
        "path": path.join(DIR, '_outils')
      },
    },
    // {
    //   resolve: `gatsby-transformer-csv`,
    // }
  ],
};

console.log(folders)
folders.forEach(folder => {
  if(!folder.startsWith('_') && fs.statSync(path.join(DIR, folder)).isDirectory() && folder !== '.git' && folder !== ".github"){
    config.plugins.push({
      resolve: 'gatsby-source-filesystem', 
      options: {
        name: folder.split('_')[2], 
        path: path.join(DIR, folder)}, 
        // ignore: [`**/*.csv`, '*.csv', '**\\*.csv', '**\\*\.csv', '**\*.csv', path.join(DIR, folder, '2024-02-08_Tutoriel_tableau_Public', 'Fichier_Atelier.csv')]
      })
    config.siteMetadata.pages.push(folder)
  }
})


module.exports = config
