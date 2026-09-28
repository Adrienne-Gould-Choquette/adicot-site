// Adicot's founding date and the whole years in business as of the build, so the
// About page's "over the past N years" stays right without an edit each October.
const FOUNDED = new Date(Date.UTC(2014, 9, 15));   // 15 October 2014

const now = new Date();
let years = now.getUTCFullYear() - FOUNDED.getUTCFullYear();
if (now.getUTCMonth() < FOUNDED.getUTCMonth()
  || (now.getUTCMonth() === FOUNDED.getUTCMonth() && now.getUTCDate() < FOUNDED.getUTCDate())) years -= 1;

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven',
  'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

export default {
  founded: '2014-10-15',
  years,
  yearsWord: WORDS[years] ?? String(years),
};
