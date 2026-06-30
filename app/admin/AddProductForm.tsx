'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AddProductForm() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('500ml')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleAdd() {
    if (!name || !price) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    let photoUrl = null

    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, photoFile)

      if (uploadError) {
        setError('Photo upload failed: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
      photoUrl = urlData.publicUrl
    }

    const { error: insertError } = await supabase.from('products').insert({
      name,
      price: parseFloat(price),
      unit,
      photo_url: photoUrl,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setName('')
    setPrice('')
    setUnit('500ml')
    setPhotoFile(null)
    setPhotoPreview(null)
    setSuccess(true)
    setTimeout(() => { setSuccess(false); window.location.reload() }, 1000)
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl p-4 space-y-3">
      <p className="font-medium text-[14px] text-[#2C2C2A]">Add new product</p>

      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Product name (e.g. Full Cream Milk)"
        className="w-full px-4 py-3.5 rounded-xl bg-[#FBF8F2] text-[#2C2C2A] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1E4D8C] text-[14px]"
      />

      <div className="flex gap-2">
        <input
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="Price (₹)"
          type="number"
          className="flex-1 px-4 py-3.5 rounded-xl bg-[#FBF8F2] text-[#2C2C2A] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1E4D8C] text-[14px]"
        />
        <input
          value={unit}
          onChange={e => setUnit(e.target.value)}
          placeholder="Unit"
          className="w-28 px-4 py-3.5 rounded-xl bg-[#FBF8F2] text-[#2C2C2A] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1E4D8C] text-[14px]"
        />
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#6b6759] mb-1.5">Product photo (optional)</label>
        <label className="flex items-center gap-3 cursor-pointer">
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="w-14 h-14 rounded-xl object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-[#FBF8F2] border-2 border-dashed border-[#E5E1D6] flex items-center justify-center text-xl">📷</div>
          )}
          <div>
            <p className="text-[13px] font-medium text-[#1E4D8C]">
              {photoPreview ? 'Change photo' : 'Add photo'}
            </p>
            <p className="text-[11px] text-[#8a8578]">Tap to choose from your device</p>
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-[13px] px-4 py-3 rounded-xl">{error}</div>
      )}

      <button
        onClick={handleAdd}
        disabled={loading || !name || !price}
        className="w-full bg-[#1E4D8C] text-white py-3.5 rounded-xl font-medium text-[14px] disabled:opacity-50 active:scale-95 transition-transform"
      >
        {success ? '✓ Added!' : loading ? 'Uploading...' : 'Add product'}
      </button>
    </div>
  )
}