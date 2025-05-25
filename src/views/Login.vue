<script lang="ts" setup>
import LoginForm from "../components/LoginForm.vue";
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12 relative">
=    <div class="absolute top-20 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]"></div>
    <div class="absolute bottom-20 -right-20 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]"></div>
    
    <div class="w-full max-w-4xl flex flex-col lg:flex-row overflow-hidden rounded-2xl shadow-xl border border-gray-700/50 backdrop-blur-xl bg-white/5 relative z-10">
      <div class="w-full lg:w-1/2 relative overflow-hidden bg-gray-800/80 backdrop-blur-xl">
        <div class="absolute inset-0 opacity-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <rect width="24" height="24" fill="none" stroke="#3B82F6" stroke-width="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div class="absolute top-10 right-25 w-58 h-58 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
        
        <div class="relative z-10 p-8 lg:p-12 flex flex-col h-full justify-center items-center text-center lg:text-left">
          <div class="flex flex-col items-center lg:items-center space-y-8">
            <div class="relative w-50 h-50 rounded-2xl overflow-hidden border border-blue-500/50 shadow-lg group hover:border-blue-500/30 transition-all duration-300">
              <img src="../assets/logo.png" alt="Raven Logo" 
                  class="w-full h-full object-cover saturate-200 brightness-125 transition-all duration-300">
            </div>
            
            <div>
              <h1 class="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Welcome to <span class="text-blue-400">Raven</span>
              </h1>
              <p class="text-gray-400 text-lg mt-2 font-medium">Your secure messaging platform</p>
            </div>
          </div>
        
          <div class="hidden lg:block space-y-4 mt-12 max-w-sm">
            <div class="flex items-center text-gray-300 p-3 rounded-xl transition-all duration-200 hover:bg-white/5 cursor-default">
              <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700/50 mr-4 transition-colors hover:bg-blue-500/20">
                <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span class="text-gray-200">Secure authentication</span>
            </div>
            
            <div class="flex items-center text-gray-300 p-3 rounded-xl transition-all duration-200 hover:bg-white/5 cursor-default">
              <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700/50 mr-4 transition-colors hover:bg-blue-500/20">
                <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <span class="text-gray-200">Real-time messaging</span>
            </div>
          </div>
          
          <div class="text-center lg:text-left mt-8">
            <p class="text-gray-400 text-sm">
              Don't have an account? 
              <router-link to="/register" class="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200">
                Create one here
              </router-link>
            </p>
          </div>
        </div>
      </div>
      
      <div class="w-full lg:w-1/2 bg-gray-800/50 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-gray-700/30 p-8 lg:p-12 flex items-center justify-center relative">
        <div class="absolute top-8 right-8 w-16 h-16 border border-blue-500/20 rounded-full"></div>
        <div class="absolute bottom-8 left-8 w-20 h-20 border border-blue-500/10 rounded-full"></div>
        
        <LoginForm />
      </div>
    </div>
  </div>
</template>
