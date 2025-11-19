import { useState, useRef } from 'react';
import { Upload, X, Image, FileAudio, FileText, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MediaUploadProps {
  onMediaUploaded: (url: string, type: 'image' | 'audio' | 'document') => void;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

export const MediaUpload = ({ onMediaUploaded }: MediaUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ url: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getMediaType = (mimeType: string): 'image' | 'audio' | 'document' | null => {
    if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image';
    if (ALLOWED_AUDIO_TYPES.includes(mimeType)) return 'audio';
    if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) return 'document';
    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo é 16MB',
        variant: 'destructive',
      });
      return;
    }

    // Validar tipo
    const mediaType = getMediaType(file.type);
    if (!mediaType) {
      toast({
        title: 'Tipo de arquivo não suportado',
        description: 'Tipos permitidos: Imagens (JPEG, PNG, GIF, WEBP), Áudios (MP3, OGG, WAV, MP4), Documentos (PDF, DOC, DOCX)',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (mediaType === 'image') {
          setPreview({ url: e.target?.result as string, type: mediaType });
        }
      };
      reader.readAsDataURL(file);

      // Upload para Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('whatsapp-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Obter URL público
      const { data: { publicUrl } } = supabase.storage
        .from('whatsapp-media')
        .getPublicUrl(data.path);

      onMediaUploaded(publicUrl, mediaType);

      toast({
        title: 'Arquivo carregado!',
        description: 'Agora você pode enviar a mídia',
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro no upload',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getIcon = () => {
    if (!preview) return <Upload className="h-6 w-6" />;
    if (preview.type === 'image') return <Image className="h-6 w-6" />;
    if (preview.type === 'audio') return <FileAudio className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_AUDIO_TYPES, ...ALLOWED_DOCUMENT_TYPES].join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <Card className="p-4 relative">
          {preview.type === 'image' && (
            <img
              src={preview.url}
              alt="Preview"
              className="max-h-32 rounded-md mx-auto"
            />
          )}
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={clearPreview}
          >
            <X className="h-4 w-4" />
          </Button>
        </Card>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              {getIcon()}
              <span className="ml-2">Anexar Mídia</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
};