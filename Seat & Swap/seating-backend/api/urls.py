from django.urls import path
from .views import getBenchLayout,addBenches,SeatingArrangement,StudentAPI,GroupAPI,StudentProfile,ClassroomList,\
    GetSeating

urlpatterns = [
    path('seating/',SeatingArrangement.as_view(),name='seating-arrangement'),
    path('get-seating/',GetSeating.as_view(),name='get-seating'),
    path('class-and-benches/',getBenchLayout.as_view(),name='benches'),
    path('add_benches/',addBenches.as_view(),name='add-bench'),
    path('students/',StudentAPI.as_view(),name='student-api'),
    path('groups/',GroupAPI.as_view(),name='groups'),
    path('student-profile/<str:pk>/',StudentProfile.as_view(),name='student-profile'),
    path('classrooms/',ClassroomList.as_view(),name='classrooms'),
]