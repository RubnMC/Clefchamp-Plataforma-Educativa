const express = require("express");
const router = express.Router();
const mysql = require("mysql");

const mysqlConfig = require("../config/db");
const DAO = require("../config/dao");

const pool = mysql.createPool(mysqlConfig);
const dao = new DAO(pool);

router.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

router.get('/', function(req, res, next) {
  res.render('index', {
    seo: {
      title: 'Clefchamp – Aprende solfeo jugando',
      description: 'Plataforma gratuita para aprender solfeo y teoría musical mediante juegos interactivos. Reconoce notas en el pentagrama, sube de nivel y compite en el ranking global.',
      canonical: 'https://clefchamp.es/',
      jsonld: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Clefchamp",
        "url": "https://clefchamp.es",
        "description": "Plataforma gratuita de aprendizaje musical mediante gamificación. Aprende solfeo y teoría musical jugando.",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
        "inLanguage": "es",
        "keywords": "solfeo, aprender música, teoría musical, notas musicales, gamificación musical, aprender solfeo"
      }
    }
  });
});

router.get("/informacion", function (request, response) {
  response.status(200)
  let pag = request.query.data
  response.render("informacion", { pag });
});

router.get("/moreInformation", function (request, response) {
  response.status(200)
  response.render("moreInformation", {
    seo: {
      title: 'Cómo funciona Clefchamp – Gamificación musical',
      description: 'Descubre cómo Clefchamp usa la gamificación para enseñar solfeo de forma divertida. Niveles, retos y ranking global para aprender música jugando.',
      canonical: 'https://clefchamp.es/moreInformation'
    }
  });
});

const blogPosts = {
  'como-aprender-solfeo': {
    title: 'Cómo aprender solfeo desde cero | Clefchamp',
    description: 'Guía completa para principiantes sobre cómo aprender solfeo paso a paso. Fundamentos, técnicas y herramientas como Clefchamp para progresar rápido.',
    canonical: 'https://clefchamp.es/blog/como-aprender-solfeo',
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Cómo aprender solfeo desde cero",
      "description": "Guía completa para aprender solfeo desde cero paso a paso.",
      "author": { "@type": "Organization", "name": "Clefchamp" },
      "publisher": { "@type": "Organization", "name": "Clefchamp", "url": "https://clefchamp.es" },
      "url": "https://clefchamp.es/blog/como-aprender-solfeo",
      "inLanguage": "es",
      "keywords": "aprender solfeo, solfeo desde cero, cómo aprender solfeo, solfeo principiantes"
    }
  },
  'notas-musicales-pentagrama': {
    title: 'Las notas musicales en el pentagrama explicadas | Clefchamp',
    description: 'Aprende qué son las notas musicales, cómo se colocan en el pentagrama y cómo memorizarlas. Guía completa para principiantes con ejercicios prácticos.',
    canonical: 'https://clefchamp.es/blog/notas-musicales-pentagrama',
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Las notas musicales en el pentagrama explicadas",
      "description": "Aprende qué son las notas musicales y cómo se colocan en el pentagrama.",
      "author": { "@type": "Organization", "name": "Clefchamp" },
      "publisher": { "@type": "Organization", "name": "Clefchamp", "url": "https://clefchamp.es" },
      "url": "https://clefchamp.es/blog/notas-musicales-pentagrama",
      "inLanguage": "es",
      "keywords": "notas musicales, pentagrama, clave de sol, aprender notas, solfeo"
    }
  },
  'gamificacion-musical': {
    title: 'Gamificación musical: aprender música jugando | Clefchamp',
    description: 'Descubre cómo la gamificación revoluciona el aprendizaje musical. Aprende por qué los juegos son la forma más eficaz de memorizar notas y teoría musical.',
    canonical: 'https://clefchamp.es/blog/gamificacion-musical',
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Gamificación musical: aprender música jugando",
      "description": "Cómo la gamificación revoluciona el aprendizaje del solfeo y la teoría musical.",
      "author": { "@type": "Organization", "name": "Clefchamp" },
      "publisher": { "@type": "Organization", "name": "Clefchamp", "url": "https://clefchamp.es" },
      "url": "https://clefchamp.es/blog/gamificacion-musical",
      "inLanguage": "es",
      "keywords": "gamificación musical, aprender música jugando, aprender solfeo, educación musical"
    }
  }
};

router.get("/blog", function (request, response) {
  response.render("blog/index", {
    seo: {
      title: 'Blog de música y solfeo | Clefchamp',
      description: 'Artículos sobre cómo aprender solfeo, teoría musical y el papel de la gamificación en la educación musical. Recursos gratuitos de Clefchamp.',
      canonical: 'https://clefchamp.es/blog'
    }
  });
});

router.get("/blog/:slug", function (request, response) {
  const slug = request.params.slug;
  const post = blogPosts[slug];
  if (!post) return response.status(404).render("404");
  response.render(`blog/${slug}`, { seo: post });
});

module.exports = router;