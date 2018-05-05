app.controller('VideosController', function ($scope, $window, $location, VideosService) {

    $scope.videos = [];

    VideosService.getVideos()
        .then(function (videos) {
            $scope.$apply(function () {
                $scope.videos = videos;
            });
        })
        .catch(err => console.log(err));

    $scope.getDate = function (date) {
        console.log(moment(date).fromNow())

    }

    //moved to main controller
    // $scope.openVideoLink
    // $scope.openUserLink

});

app.controller('CurrentVideoController', function ($scope, $location, VideosService) {
    $scope.videoID = $location.path().substring(1);
    $scope.currentVideo = {};
    $scope.videos = [];
    $scope.isLikedByMe = false;
    $scope.isDislikedByMe = false;
    $scope.newPlaylistTitle = '';

    //loads selected video
    VideosService.loadVideo($scope.videoID)
        .then(function (currentVideo) {
            $scope.$apply(function () {
                $scope.currentVideo = currentVideo;
                checkIsRatedByMe();
            });
        })
        //--->>> must redirect to not found page <<<---
        .catch(err => console.log(err));


    //gets all videos in the right sidebar
    VideosService.getVideos()
        .then(function (videos) {
            $scope.$apply(function () {
                $scope.videos = videos;
            });
        })
        .catch(err => console.log(err));

    $scope.userPlaylists = [];
    //gets all playlists that are created by the logged user
    $scope.getLoggedUserPlaylist = function (userID) {
        VideosService.getLoggedUserPlaylist(userID)
            .then(function (playlists) {
                playlists.forEach(playlist => {
                   playlist.isChecked = !!playlist.videos.find(id => id === $scope.videoID);
                });
                $scope.$apply(function () {
                    $scope.userPlaylists = playlists;
                })
            })
            .catch(err => console.log(err.data));
    };


    //toggle song in the selected playlist
    $scope.toggleSong = function (playlist) {
        playlist.isChecked = !playlist.isChecked;
        VideosService.toggleSong(playlist, $scope.videoID)
            .then(function (response) {
                $scope.$apply(function () {
                    console.log(response);
                })
            })
            .catch(err => console.log(err.data));
    };


    //creates new playlist
    $scope.createPlaylist = function () {
        if ($scope.newPlaylistTitle.trim().length === 0) {
            return;
        }

        var newPlaylist = {
            title: $scope.newPlaylistTitle,
            videos: [$scope.videoID]
        };
        VideosService.createPlaylist(newPlaylist)
            .then(function (playlist) {
                playlist.isChecked = true;
                $scope.$apply(function () {
                    $scope.userPlaylists.push(playlist);
                    $scope.newPlaylistTitle = '';
                })
            })
            .catch(err => console.log(err.data));
    };


    //update video rate (like/dislike) of watched video
    $scope.updateVideoRate = function (vote) {
        VideosService.updateVideoRate($scope.videoID, {vote: vote})
            .then(function (response) {
                $scope.$apply(function () {
                    $scope.currentVideo.likedByUserIDs = response.data.likedByUserIDs;
                    $scope.currentVideo.dislikedByUserIDs = response.data.dislikedByUserIDs;
                    checkIsRatedByMe();
                });
            })
            //--->>> if error is 401 must show option for login <<<---
            //--->>> if error is 403 must alert that this video is uploaded by the same user <<<---
            .catch(err => console.log(err));
    };

    function checkIsRatedByMe() {
        var user = JSON.parse(localStorage.getItem('logged'));
        if (!!user) {
            if (!!$scope.currentVideo.likedByUserIDs.find(id => id === user.userId)) {
                $scope.isLikedByMe = true;
            } else {
                $scope.isLikedByMe = false;
            }

            if (!!$scope.currentVideo.dislikedByUserIDs.find(id => id === user.userId)) {
                $scope.isDislikedByMe = true;
            } else {
                $scope.isDislikedByMe = false;
            }
        }
    }

    //moved to main controller
    // $scope.openVideoLink
    // $scope.openUserLink

});