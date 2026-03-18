import { Avatar, AvatarFallback, AvatarImage } from '@/views/components/ui/avatar';
import { Button } from '@/views/components/ui/button';
import { PencilSimple, Trash, User } from '@phosphor-icons/react';
import { ChangeEvent, useRef } from 'react';

type ProfileAvatarPickerProps = {
  src?: string;
  alt?: string;
  onPickImage: (file: File) => void;
  onRemoveImage: () => void;
  disabled?: boolean;
};

export function ProfileAvatarPicker({
  src,
  alt,
  onPickImage,
  onRemoveImage,
  disabled,
}: ProfileAvatarPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function triggerFileInput() {
    if (disabled) return;
    fileInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    onPickImage(file);
    event.target.value = '';
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-fit">
        <Avatar className="h-40 w-40 rounded-md border border-slate-200">
          <AvatarImage src={src} alt={alt ?? 'Avatar do perfil'} />
          <AvatarFallback className="rounded-md bg-slate-100 text-slate-400">
            <User size={56} />
          </AvatarFallback>
        </Avatar>

        <Button
          type="button"
          size="icon"
          variant="outline"
          className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-white shadow-sm"
          onClick={triggerFileInput}
          disabled={disabled}
          aria-label="Alterar avatar">
          <PencilSimple size={16} />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="outline"
          className="absolute -bottom-3 -right-3 h-9 w-9 rounded-full bg-white shadow-sm"
          onClick={onRemoveImage}
          disabled={disabled}
          aria-label="Remover avatar">
          <Trash size={16} />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>

      <p className="text-sm text-[#9da1c2]">Allowed file types: png, jpg, jpeg.</p>
    </div>
  );
}
