import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const LoginEmpresa = () => {
    const [slug, setSlug] = useState('')
    const [loading, setLoading] = useState(false)
    const [apiResponse, setApiResponse] = useState<any>(null) // Estado para guardar la respuesta
    const navigate = useNavigate()

    const handleIdentificar = async () => {
        setLoading(true)
        setApiResponse(null) // Limpiamos respuesta anterior

        try {
            const response = await fetch('http://127.0.0.1:8000/api/identificar-empresa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ slug: slug })
            })

            const data = await response.json() 
            setApiResponse(data) 

            if (response.ok) {
                // Usamos la variable 'data' que ya extrajimos arriba
                navigate(`/${data.slug}/login`);
            } else {
                console.error('Error en API:', data)
            }
        } catch (error) {
            setApiResponse({ error: 'No se pudo conectar con el servidor' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <section id="center">
            <h2>Identificar Empresa</h2>
            <input
                type="text"
                placeholder="Ej: pizzeria-napoli"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="login-input"
                style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                <button onClick={() => navigate(-1)}>Atrás</button>
                <button onClick={handleIdentificar} disabled={loading}>
                    {loading ? 'Cargando...' : 'Iniciar Sesión'}
                </button>
            </div>

            {/* BLOQUE PARA IMPRIMIR LA RESPUESTA */}
            {apiResponse && (
                <div style={{
                    marginTop: '20px',
                    textAlign: 'left',
                    backgroundColor: '#1a1a1a',
                    padding: '15px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: '1px solid #646cff'
                }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#646cff' }}>Respuesta de la API:</h4>
                    <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                </div>
            )}
        </section>
    )
}