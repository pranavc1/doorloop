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

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

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
    <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
      <p className="font-medium text-slate-700">Add new product</p>

      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Product name (e.g. Full Cream Milk)"
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
      />

      <div className="flex gap-2">
        <input
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="Price (₹)"
          type="number"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
        />
        <input
          value={unit}
          onChange={e => setUnit(e.target.value)}
          placeholder="Unit"
          className="w-28 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
        />
      </div>

      {/* Photo upload */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Product photo (optional)
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              className="w-16 h-16 rounded-xl object-cover border border-slate-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-2xl">
              📷
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-blue-600">
              {photoPreview ? 'Change photo' : 'Add photo'}
            </p>
            <p className="text-xs text-slate-400">Tap to choose from your device</p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <button
        onClick={handleAdd}
        disabled={loading || !name || !price}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 active:scale-95 transition-transform"
      >
        {success ? '✓ Added!' : loading ? 'Uploading...' : 'Add Product'}
      </button>
    </div>
  )
}