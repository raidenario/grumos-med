import { useState } from "react";

interface ProfilePhotoUploadProps {
    updateProfilePhoto: (file: File) => Promise<void>;
}

// Exemplo conceitual
function ProfilePhotoUpload({ updateProfilePhoto }: ProfilePhotoUploadProps) {
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Criar preview local
            setPreview(URL.createObjectURL(file));

            // Fazer upload
            updateProfilePhoto(file)
                .then(() => alert('Foto atualizada!'))
                .catch((err) => alert('Erro ao atualizar'));
        }
    };

    return (
        <div>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {preview && <img src={preview} alt="Preview" />}
        </div>
    );
}

export default ProfilePhotoUpload;
