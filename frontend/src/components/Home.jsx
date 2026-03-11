import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="home-container">
      <h2 className="home-title">{t('home.title')}</h2>
      <div className="home-buttons">
        <Link to="/best-crop">
          <button className="home-button">{t('home.bestCropBtn')}</button>
        </Link>
        <Link to="/yield-predictor">
          <button className="home-button">{t('home.yieldPredictorBtn')}</button>
        </Link>
      </div>
    </div>
  );
}
