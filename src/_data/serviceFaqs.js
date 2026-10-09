// FAQs for each service page, keyed by the page's slug. Shown on the
// page by layouts/service.njk and published as FAQPage structured data by
// tools/schema.mjs, so the two can never disagree.
//
// Every answer restates something the site already says elsewhere (the service
// pages, About, the quote page). Keep it that way: a figure changed there must
// be changed here. Answers are HTML; links are site-relative.
import fs from 'node:fs';

export default function () {
  const services = JSON.parse(fs.readFileSync('src/_data/services.json', 'utf8'));
  const states = services.licensedIn.map(s => s.name);
  const stateList = `${states.slice(0, -1).join(', ')} and ${states.at(-1)}`;

  const licensed = {
    q: 'Which states can you stamp in?',
    a: `Adicot holds active professional engineer licensure in ${states.length} states: ${stateList}. ` +
       'Our principal is an NCEES Model Law Engineer, a designation that supports licensure applications in other ' +
       'U.S. jurisdictions, so <a href="/contact">ask us</a> if your project is somewhere else.',
  };
  const price = {
    q: 'How much does it cost?',
    a: 'Most projects are priced through the <a href="/quote">online quote tool</a>: enter the project type, square ' +
       'footage and turnaround, and the fee appears on screen. That figure is preliminary. The final fee is ' +
       'confirmed in writing after we review your documents and scope.',
  };

  return {
    'cooling-load-calculations': [
      {
        q: 'How long does a load calculation take?',
        a: 'Most load calculations are returned within 5 to 10 business days of scope confirmation. Rush turnarounds ' +
           'are available when the schedule requires one. Larger multi-building projects are quoted individually.',
      },
      {
        q: 'What do you need from me to start?',
        a: 'The drawings, the project type, the square footage and the turnaround you need. Envelope assemblies, ' +
           'glazing, occupancy, lighting and equipment loads are taken from the drawings and the project\'s code. If ' +
           'something is missing, we send a list of what is still needed. See ' +
           '<a href="/post/collecting-building-info-for-load-and-energy-calcs">an example of a clear response</a>.',
      },
      licensed,
      price,
      {
        q: 'Which method and code do you work to?',
        a: 'The building code adopted in the project\'s jurisdiction governs. It sets the design conditions, the ' +
           'ventilation requirements and which standards apply. Commercial load calculations follow ASHRAE methods, ' +
           'and where the code references an ASHRAE standard we work to the edition the code references.',
      },
      {
        q: 'What is in the deliverable?',
        a: 'Room-by-room cooling and heating loads, ventilation rates to the governing code, and equipment ' +
           'sizing recommendations with the assumptions written down, in a stamped document ready for plan review.',
      },
      {
        q: 'Do you run block loads or room-by-room loads?',
        a: 'Room by room. Each room is calculated with its own orientation, glazing and occupancy instead of being ' +
           'averaged across the building, which is much more accurate than a block load.',
      },
      {
        q: 'Can I use the free Cooling Load Ballpark Estimator instead?',
        a: 'Not for a permit. The <a href="/cooling-load-estimator">Cooling Load Ballpark Estimator</a> gives a ' +
           'pre-design ballpark from historical check figures. It is a quick check on a load calculation, not a load ' +
           'calculation, and it is not stamped.',
      },
    ],
    'energy-code-compliance': [
      {
        q: 'Which energy code applies to my project?',
        a: 'There is no single national energy code. Each state adopts its own: an edition of the IECC, ASHRAE 90.1, ' +
           'or a code the state has written itself, and local jurisdictions can amend it further. We confirm the ' +
           'adopted code for the jurisdiction before any modeling starts.',
      },
      {
        q: 'Do you use the prescriptive path or the performance path?',
        a: 'Performance. We model the building and demonstrate compliance on performance. The prescriptive path is ' +
           'less work to document, but it makes the building much more expensive to construct, so we do not use it.',
      },
      {
        q: 'Which compliance software do you use?',
        a: 'Whichever tool the jurisdiction expects: EnergyGauge, COMcheck, or another as required.',
      },
      licensed,
      {
        q: 'What do I receive?',
        a: 'A completed, stamped compliance report in the format the plan reviewer expects, plus a written list of ' +
           'what the design must hold to in order to stay compliant.',
      },
      {
        q: 'Can you do the load calculations as well?',
        a: 'Yes. Compliance work and <a href="/services/cooling-load-calculations">load calculations</a> share the ' +
           'same envelope and system inputs, so running both together is cheaper and removes a class of discrepancy ' +
           'that plan reviewers look for.',
      },
      {
        q: 'How long does it take?',
        a: 'Most projects are delivered within 5 to 10 business days of scope confirmation, with rush turnarounds ' +
           'available when the schedule requires one.',
      },
      price,
    ],
  };
}
