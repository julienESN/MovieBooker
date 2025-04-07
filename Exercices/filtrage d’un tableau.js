const article = [
  { id: 1, name: 'Article 1' },
  { id: 2, name: 'Article 2' },
  { id: 3, name: 'Article 3' },
  { id: 4, name: 'Article 4' },
  { id: 5, name: 'Article 5' },
  { id: 6, name: 'Article 6' },
  { id: 7, name: 'Article 7' },
  { id: 8, name: 'Article 8' },
  { id: 9, name: 'Article 9' },
  { id: 10, name: 'Article 10' },
];

function filter(article, filter) {
  return article.filter((item) => item.name.includes(filter));
}

const filteredArticles = filter(article, '1');
console.log(filteredArticles);
//[ { id: 1, name: 'Article 1' }, { id: 10, name: 'Article 10' } ]
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
