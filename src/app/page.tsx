"use client"

import { useState, useEffect } from 'react'
import { Search, Package, MapPin, Clock, CheckCircle, Truck, Building, User, Plus, Edit, Trash2, Eye, Lock, Phone, Mail, CreditCard } from 'lucide-react'

// Tipos para o sistema de rastreamento
interface TrackingEvent {
  id: string
  timestamp: string
  location: string
  status: string
  description: string
}

interface Order {
  id: string
  trackingCode: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerCpf: string
  origin: string
  destination: string
  currentLocation: string
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
  createdAt: string
  estimatedDelivery: string
  events: TrackingEvent[]
}

// Dados de exemplo
const initialOrders: Order[] = [
  {
    id: '1',
    trackingCode: 'TR001234567',
    customerName: 'João Silva',
    customerEmail: 'joao@email.com',
    customerPhone: '(11) 99999-9999',
    customerCpf: '123.456.789-00',
    origin: 'São Paulo, SP',
    destination: 'Rio de Janeiro, RJ',
    currentLocation: 'Taubaté, SP',
    status: 'in_transit',
    createdAt: '2024-01-15T10:00:00Z',
    estimatedDelivery: '2024-01-18T18:00:00Z',
    events: [
      {
        id: '1',
        timestamp: '2024-01-15T10:00:00Z',
        location: 'São Paulo, SP',
        status: 'Pedido criado',
        description: 'Pedido foi criado e está sendo preparado'
      },
      {
        id: '2',
        timestamp: '2024-01-15T14:30:00Z',
        location: 'São Paulo, SP',
        status: 'Em trânsito',
        description: 'Mercadoria saiu para entrega'
      },
      {
        id: '3',
        timestamp: '2024-01-16T09:15:00Z',
        location: 'Taubaté, SP',
        status: 'Em trânsito',
        description: 'Mercadoria passou pelo centro de distribuição'
      }
    ]
  },
  {
    id: '2',
    trackingCode: 'TR001234568',
    customerName: 'Maria Santos',
    customerEmail: 'maria@email.com',
    customerPhone: '(21) 88888-8888',
    customerCpf: '987.654.321-00',
    origin: 'Belo Horizonte, MG',
    destination: 'Salvador, BA',
    currentLocation: 'Salvador, BA',
    status: 'delivered',
    createdAt: '2024-01-10T08:00:00Z',
    estimatedDelivery: '2024-01-15T16:00:00Z',
    events: [
      {
        id: '1',
        timestamp: '2024-01-10T08:00:00Z',
        location: 'Belo Horizonte, MG',
        status: 'Pedido criado',
        description: 'Pedido foi criado e está sendo preparado'
      },
      {
        id: '2',
        timestamp: '2024-01-12T11:20:00Z',
        location: 'Salvador, BA',
        status: 'Entregue',
        description: 'Mercadoria foi entregue ao destinatário'
      }
    ]
  }
]

export default function TrackingSystem() {
  const [currentView, setCurrentView] = useState<'public' | 'admin' | 'login'>('public')
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [searchCode, setSearchCode] = useState('')
  const [foundOrder, setFoundOrder] = useState<Order | null>(null)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState<Order | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Senha do admin (em produção, use variáveis de ambiente)
  const ADMIN_PASSWORD = 'admin123'

  // Função para login do admin
  const handleAdminLogin = () => {
    if (loginPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setCurrentView('admin')
      setLoginPassword('')
      setLoginError('')
    } else {
      setLoginError('Senha incorreta!')
    }
  }

  // Função para logout
  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentView('public')
  }

  // Função para buscar pedido
  const handleSearch = () => {
    const order = orders.find(o => o.trackingCode.toLowerCase() === searchCode.toLowerCase())
    setFoundOrder(order || null)
  }

  // Função para gerar código de rastreamento
  const generateTrackingCode = () => {
    return 'TR' + Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  // Função para criar novo pedido
  const handleCreateOrder = (orderData: Partial<Order>) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      trackingCode: generateTrackingCode(),
      customerName: orderData.customerName || '',
      customerEmail: orderData.customerEmail || '',
      customerPhone: orderData.customerPhone || '',
      customerCpf: orderData.customerCpf || '',
      origin: orderData.origin || '',
      destination: orderData.destination || '',
      currentLocation: orderData.origin || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedDelivery: orderData.estimatedDelivery || '',
      events: [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          location: orderData.origin || '',
          status: 'Pedido criado',
          description: 'Pedido foi criado e está sendo preparado'
        }
      ]
    }
    setOrders([...orders, newOrder])
    setShowOrderForm(false)
  }

  // Função para atualizar status do pedido
  const updateOrderStatus = (orderId: string, newStatus: Order['status'], location: string, description: string) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const newEvent: TrackingEvent = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          location,
          status: newStatus === 'delivered' ? 'Entregue' : newStatus === 'in_transit' ? 'Em trânsito' : 'Pendente',
          description
        }
        return {
          ...order,
          status: newStatus,
          currentLocation: location,
          events: [...order.events, newEvent]
        }
      }
      return order
    }))
  }

  // Função para deletar pedido
  const deleteOrder = (orderId: string) => {
    setOrders(orders.filter(order => order.id !== orderId))
  }

  // Componente de login do admin
  const AdminLogin = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-lg inline-block mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Acesso Administrativo</h2>
          <p className="text-gray-600 mt-2">Digite a senha para acessar o painel</p>
        </div>
        
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Senha do administrador"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
          />
          
          {loginError && (
            <p className="text-red-500 text-sm">{loginError}</p>
          )}
          
          <button
            onClick={handleAdminLogin}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            Entrar
          </button>
          
          <button
            onClick={() => setCurrentView('public')}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Voltar à Área Pública
          </button>
        </div>
      </div>
    </div>
  )

  // Componente de formulário para novo pedido
  const OrderForm = ({ order, onSubmit, onCancel }: { order?: Order, onSubmit: (data: Partial<Order>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState({
      customerName: order?.customerName || '',
      customerEmail: order?.customerEmail || '',
      customerPhone: order?.customerPhone || '',
      customerCpf: order?.customerCpf || '',
      origin: order?.origin || '',
      destination: order?.destination || '',
      estimatedDelivery: order?.estimatedDelivery || ''
    })

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">{order ? 'Editar Pedido' : 'Novo Pedido'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome do cliente"
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Email do cliente"
              value={formData.customerEmail}
              onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="tel"
              placeholder="Telefone do cliente"
              value={formData.customerPhone}
              onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="CPF do cliente"
              value={formData.customerCpf}
              onChange={(e) => setFormData({...formData, customerCpf: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Origem"
              value={formData.origin}
              onChange={(e) => setFormData({...formData, origin: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Destino"
              value={formData.destination}
              onChange={(e) => setFormData({...formData, destination: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="datetime-local"
              placeholder="Previsão de entrega"
              value={formData.estimatedDelivery}
              onChange={(e) => setFormData({...formData, estimatedDelivery: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-2"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onSubmit(formData)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              {order ? 'Atualizar' : 'Criar Pedido'}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Modal para atualizar status do pedido
  const UpdateStatusModal = ({ order }: { order: Order }) => {
    const [newLocation, setNewLocation] = useState(order.currentLocation)
    const [newStatus, setNewStatus] = useState(order.status)
    const [description, setDescription] = useState('')

    const handleUpdate = () => {
      updateOrderStatus(order.id, newStatus, newLocation, description)
      setShowUpdateModal(null)
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">Atualizar Status</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as Order['status'])}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pendente</option>
                <option value="in_transit">Em Trânsito</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localização Atual</label>
              <input
                type="text"
                placeholder="Cidade atual do pedido"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                placeholder="Descrição da atualização"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleUpdate}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              Atualizar
            </button>
            <button
              onClick={() => setShowUpdateModal(null)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Se não está autenticado e tentando acessar admin, mostra tela de login
  if (currentView === 'admin' && !isAuthenticated) {
    return <AdminLogin />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TrackLog</h1>
                <p className="text-sm text-gray-600">Sistema de Rastreamento</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentView('public')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'public' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Eye className="h-4 w-4 inline mr-2" />
                Área Pública
              </button>
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setCurrentView('admin')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentView === 'admin' 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <User className="h-4 w-4 inline mr-2" />
                    Painel Admin
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setCurrentView('admin')}
                  className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  <Lock className="h-4 w-4 inline mr-2" />
                  Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'public' ? (
          // Área Pública - Rastreamento
          <div className="space-y-8">
            {/* Seção de Busca */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Rastreie seu Pedido</h2>
                <p className="text-gray-600">Digite o código de rastreamento para acompanhar sua entrega</p>
              </div>
              
              <div className="max-w-md mx-auto">
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Ex: TR001234567"
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                  >
                    Rastrear
                  </button>
                </div>
              </div>
            </div>

            {/* Resultado da Busca */}
            {foundOrder && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="border-b pb-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">Detalhes do Pedido</h3>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      foundOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      foundOrder.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      foundOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {foundOrder.status === 'delivered' ? 'Entregue' :
                       foundOrder.status === 'in_transit' ? 'Em Trânsito' :
                       foundOrder.status === 'pending' ? 'Pendente' : 'Cancelado'}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Código de Rastreamento</p>
                      <p className="font-mono text-lg font-bold text-blue-600">{foundOrder.trackingCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Cliente</p>
                      <p className="font-medium">{foundOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="flex items-center text-sm">
                        <Mail className="h-4 w-4 text-blue-500 mr-2" />
                        {foundOrder.customerEmail}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Telefone</p>
                      <p className="flex items-center text-sm">
                        <Phone className="h-4 w-4 text-green-500 mr-2" />
                        {foundOrder.customerPhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">CPF</p>
                      <p className="flex items-center text-sm">
                        <CreditCard className="h-4 w-4 text-purple-500 mr-2" />
                        {foundOrder.customerCpf}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Localização Atual</p>
                      <p className="flex items-center font-medium text-orange-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {foundOrder.currentLocation}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Origem</p>
                      <p className="flex items-center">
                        <MapPin className="h-4 w-4 text-green-500 mr-2" />
                        {foundOrder.origin}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Destino</p>
                      <p className="flex items-center">
                        <MapPin className="h-4 w-4 text-red-500 mr-2" />
                        {foundOrder.destination}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline de Eventos */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Histórico de Rastreamento</h4>
                  <div className="space-y-4">
                    {foundOrder.events.map((event, index) => (
                      <div key={event.id} className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${
                          index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{event.status}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(event.timestamp).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {searchCode && !foundOrder && (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Package className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pedido não encontrado</h3>
                <p className="text-gray-600">Verifique se o código de rastreamento está correto</p>
              </div>
            )}
          </div>
        ) : (
          // Painel Administrativo
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Painel Administrativo</h2>
                <p className="text-gray-600">Gerencie todos os pedidos e rastreamentos</p>
              </div>
              <button
                onClick={() => setShowOrderForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Novo Pedido</span>
              </button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Pedidos</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Em Trânsito</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {orders.filter(o => o.status === 'in_transit').length}
                    </p>
                  </div>
                  <Truck className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Entregues</p>
                    <p className="text-2xl font-bold text-green-600">
                      {orders.filter(o => o.status === 'delivered').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {orders.filter(o => o.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Lista de Pedidos */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-bold text-gray-900">Todos os Pedidos</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rota
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Localização Atual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-medium text-blue-600">
                            {order.trackingCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="font-medium text-gray-900">{order.customerName}</p>
                            <p className="text-sm text-gray-500">{order.customerCpf}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <p className="text-gray-900 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {order.customerEmail}
                            </p>
                            <p className="text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {order.customerPhone}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <p className="text-gray-900">{order.origin}</p>
                            <p className="text-gray-500">→ {order.destination}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-orange-600 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {order.currentLocation}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status === 'delivered' ? 'Entregue' :
                             order.status === 'in_transit' ? 'Em Trânsito' :
                             order.status === 'pending' ? 'Pendente' : 'Cancelado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setShowUpdateModal(order)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Atualizar Status"
                            >
                              <Truck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingOrder(order)
                                setShowOrderForm(true)
                              }}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="Editar Pedido"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteOrder(order.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Deletar Pedido"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Formulário */}
      {showOrderForm && (
        <OrderForm
          order={editingOrder || undefined}
          onSubmit={(data) => {
            if (editingOrder) {
              setOrders(orders.map(order => 
                order.id === editingOrder.id 
                  ? { ...order, ...data }
                  : order
              ))
              setEditingOrder(null)
            } else {
              handleCreateOrder(data)
            }
            setShowOrderForm(false)
          }}
          onCancel={() => {
            setShowOrderForm(false)
            setEditingOrder(null)
          }}
        />
      )}

      {/* Modal de Atualização de Status */}
      {showUpdateModal && (
        <UpdateStatusModal order={showUpdateModal} />
      )}
    </div>
  )
}