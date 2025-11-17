type IMCRange = {
  max: number;
  classificacao: string;
};

const IMC_TABLE: IMCRange[] = [
  { max: 18.5, classificacao: "Abaixo do peso" },
  { max: 25, classificacao: "Peso normal" },
  { max: 30, classificacao: "Sobrepeso" },
  { max: 35, classificacao: "Obesidade grau I" },
  { max: 40, classificacao: "Obesidade grau II" },
  { max: Infinity, classificacao: "Obesidade grau III" }
];

export function calculateIMC(height: number, kg: number) {
  const imc = kg / (height * height);
  const resultIMC = Number(imc.toFixed(2));

  const range = IMC_TABLE.find((rangeIMC) => resultIMC < rangeIMC.max)!;

  return {
    imc: resultIMC,
    classificacao: range.classificacao,
  };
}
