import Card from "./card";

const RegionLabels: Record<string, string> = {
  upz: "UPZ",
  barrio: "Barrio",
  localidad: "Localidad",
};

export default function RegionInfoCard({ regionInfo, estrato }: { regionInfo: Record<string, { nombre: string; codigo: string }>, estrato: number }) {
  return (
    <Card title="Información de la Región" subtitle="Datos geográficos de la región donde se encuentra el apartamento">
        <ul className="list-disc pl-5">
          {Object.entries(regionInfo).map(([key, value]) => (
            <li key={key} className="mb-1">
              <span className="font-medium">{RegionLabels[key] ?? key}:</span> {value.nombre}
            </li>
          ))}
          <li><span className="font-medium">Estrato:</span>{estrato}</li>
        </ul>
    </Card>
  );
}
