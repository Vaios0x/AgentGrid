'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { NeuralCard } from '../ui/neural-card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { 
  DollarSign, 
  Clock, 
  Zap, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useToast } from '../../hooks/use-toast'

interface HireAgentProps {
  agentId: string
}

interface HireFormData {
  taskDescription: string
  budget: string
  priority: 'low' | 'medium' | 'high'
  deadline: string
  specialInstructions: string
}

export function HireAgent({ agentId }: HireAgentProps) {
  const [formData, setFormData] = useState<HireFormData>({
    taskDescription: '',
    budget: '0.05',
    priority: 'medium',
    deadline: '',
    specialInstructions: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const { toast } = useToast()

  const handleInputChange = (field: keyof HireFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Agent Hired Successfully!",
        description: "Your task has been submitted to the agent. You'll receive updates via email.",
        variant: "success"
      })
      
      setStep(3)
    } catch (error) {
      toast({
        title: "Hiring Failed",
        description: "There was an error hiring the agent. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  if (step === 3) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <NeuralCard>
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Agent Hired!</h3>
            <p className="text-gray-300 mb-6">
              Your task has been submitted successfully. The agent will start working on it shortly.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• You'll receive email updates on progress</p>
              <p>• Payment will be processed upon completion</p>
              <p>• You can track progress in your dashboard</p>
            </div>
            <Button 
              onClick={() => setStep(1)}
              className="mt-6 bg-primary-500 hover:bg-primary-600 text-white"
            >
              Hire Another Agent
            </Button>
          </div>
        </NeuralCard>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <NeuralCard>
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-6">Hire This Agent</h3>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= stepNumber
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/10 text-gray-400'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      step > stepNumber ? 'bg-primary-500' : 'bg-white/10'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="taskDescription" className="text-white font-semibold">
                    Task Description *
                  </Label>
                  <Textarea
                    id="taskDescription"
                    value={formData.taskDescription}
                    onChange={(e) => handleInputChange('taskDescription', e.target.value)}
                    placeholder="Describe what you want the agent to do..."
                    className="mt-2 bg-white/5 border-white/20 text-white placeholder-gray-400"
                    rows={4}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="budget" className="text-white font-semibold">
                    Budget (PYUSD) *
                  </Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="budget"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="pl-10 bg-white/5 border-white/20 text-white"
                      placeholder="0.05"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="priority" className="text-white font-semibold">
                    Priority Level
                  </Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="mt-2 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white"
                  >
                    <option value="low">Low - Standard processing</option>
                    <option value="medium">Medium - Faster processing</option>
                    <option value="high">High - Priority processing</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="deadline" className="text-white font-semibold">
                    Deadline (Optional)
                  </Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', (e.target as any).value)}
                    className="mt-2 bg-white/5 border-white/20 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="specialInstructions" className="text-white font-semibold">
                    Special Instructions
                  </Label>
                  <Textarea
                    id="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    placeholder="Any specific requirements or preferences..."
                    className="mt-2 bg-white/5 border-white/20 text-white placeholder-gray-400"
                    rows={3}
                  />
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={prevStep}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Previous
                </Button>
              )}
              
              {step < 2 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-primary-500 hover:bg-primary-600 text-white ml-auto"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.taskDescription || !formData.budget}
                  className="bg-primary-500 hover:bg-primary-600 text-white ml-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Hiring Agent...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Hire Agent
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </NeuralCard>
    </motion.div>
  )
}
