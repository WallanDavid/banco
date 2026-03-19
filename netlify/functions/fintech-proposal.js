function round2(n) {
  return Math.round(n * 100) / 100;
}

function pickFromSeed(seed, items) {
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  x = (x * 16807) % 2147483647;
  const idx = Math.floor((x / 2147483647) * items.length);
  return items[Math.min(items.length - 1, Math.max(0, idx))];
}

exports.handler = async (event) => {
  const qp = event.queryStringParameters || {};
  const leadId = qp.leadId || 'lead_demo';
  const amount = Number(qp.amount || 12000);
  const profile = qp.profile || 'aposentado_pensionista';
  const requestedPartner = qp.partner;

  const seed = Array.from(String(leadId)).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + Math.floor(amount);
  const partner = requestedPartner === 'V8' || requestedPartner === 'PRESENCA'
    ? requestedPartner
    : pickFromSeed(seed, ['V8', 'PRESENCA']);

  const baseRate =
    profile === 'servidor_publico'
      ? 0.0145
      : profile === 'aposentado_pensionista'
        ? 0.0155
        : 0.0215;

  const partnerAdj = partner === 'V8' ? -0.0006 : 0.0004;
  const nominalRateMonthly = Math.max(0.0129, Math.min(0.0299, baseRate + partnerAdj));

  const installments =
    profile === 'clt'
      ? pickFromSeed(seed + 7, [12, 18, 24, 30, 36])
      : pickFromSeed(seed + 11, [48, 60, 72, 84]);

  const feePct = partner === 'V8' ? 0.012 : 0.017;
  const fee = round2(amount * feePct);
  const releasedValue = round2(Math.max(0, amount - fee));

  const i = nominalRateMonthly;
  const n = installments;
  const installmentValue = round2((amount * i) / (1 - Math.pow(1 + i, -n)));

  const cetAnnual = round2((Math.pow(1 + nominalRateMonthly, 12) - 1) * 100);

  const payload = {
    proposalId: `prop_${Date.now().toString(16)}_${Math.floor(seed).toString(16)}`,
    leadId,
    partner,
    profile,
    requestedAmount: round2(amount),
    releasedValue,
    fee,
    nominalRateMonthly: round2(nominalRateMonthly * 100),
    cetAnnual,
    installments,
    installmentValue,
    status: 'pre_approved',
  };

  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
    body: JSON.stringify(payload),
  };
};

