import { useTranslation } from "react-i18next";

export default function OutputCard({ result }) {
  const { t } = useTranslation();
  console.log("OutputCard received result:", result);
  return (
    <div className="card">
      <h2>Result</h2>
      {result.crop && (
        <>
          <p><strong>{t('output.recommendedCrop')}:</strong> {result.crop[0].crop}</p>
          <p><strong>Alternatives:</strong> {result.crop[1].crop}, {result.crop[2].crop} </p>
        </>
      )}

      {/* Only show 'Predicted Yield' if result.yield has a value */}
      {result.yield && (
        <p><strong>{t('output.predictedYield')}:</strong> {result.yield}</p>
      )}
      {result.location?.lat && (
        <p><strong>Location:</strong> {result.location.lat.toFixed(4)}, {result.location.lon.toFixed(4)}</p>
      )}
    </div>
  );
}
