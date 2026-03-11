import { useTranslation } from "react-i18next";

const NotFound = () => {
    const { t } = useTranslation();
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>404 - {t('notFound.title')}</h2>
            <p>{t('notFound.message')}</p>
            <a href="/">{t('notFound.link')}</a>
        </div>
    );
};

export default NotFound;
