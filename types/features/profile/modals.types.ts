/**
 * Props pour le composant ReportModal
 */
export interface ReportModalProps {
    /** Visibilité de la modale */
    isVisible: boolean;
    /** Fonction pour fermer la modale */
    onClose: () => void;
    /** Fonction pour envoyer le signalement */
    onSendReport: (reason: string) => Promise<void>;
  }