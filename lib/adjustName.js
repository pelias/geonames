module.exports = function adjustName(doc){
  const default_name = doc.getName('default');

  const starts_with_city_of = /^City of /;
  if (starts_with_city_of.test(default_name)) {
    doc.setName('default', default_name.replace(/^City of /, ''));
    doc.setNameAlias('default', default_name);
  }

  return doc;
};
